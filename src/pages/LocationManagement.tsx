
import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { locationApi } from '@/services/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Loader2, Trash2, Edit, MapPin, Map as MapIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';

const MAP_ACCESS_TOKEN = 'pk.eyJ1IjoiZXhhbXBsZXVzZXIiLCJhIjoiY2tleTExOXdvMDVrcjMxbDkyd2s2NWFmZSJ9.example-placeholder';

interface Point {
  lng: number;
  lat: number;
}

const LocationManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const draw = useRef<any>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  
  const [name, setName] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [radius, setRadius] = useState('');
  const [description, setDescription] = useState('');
  const [polygonPoints, setPolygonPoints] = useState<Point[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [mapTab, setMapTab] = useState('list');

  // Fetch locations
  const { data: locations = [], isLoading } = useQuery({
    queryKey: ['locations'],
    queryFn: locationApi.getAll,
  });

  // Create location mutation
  const createLocationMutation = useMutation({
    mutationFn: (locationData: any) => locationApi.create(locationData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      resetForm();
      toast({
        title: 'Success',
        description: 'Location has been created successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to create location: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Update location mutation
  const updateLocationMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: any }) => locationApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      resetForm();
      toast({
        title: 'Success',
        description: 'Location has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to update location: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Delete location mutation
  const deleteLocationMutation = useMutation({
    mutationFn: (id: number) => locationApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast({
        title: 'Success',
        description: 'Location has been deleted successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to delete location: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Initialize map
  useEffect(() => {
    if (mapContainer.current && !map.current && mapTab === 'map') {
      try {
        mapboxgl.accessToken = MAP_ACCESS_TOKEN;
        
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v11',
          center: [0, 0],
          zoom: 1
        });

        map.current.on('load', () => {
          // Initialize map drawing tools
          import('@mapbox/mapbox-gl-draw').then(({ default: MapboxDraw }) => {
            draw.current = new MapboxDraw({
              displayControlsDefault: false,
              controls: {
                polygon: true,
                trash: true
              }
            });
            
            map.current?.addControl(draw.current);
            
            // Listen for draw events
            map.current?.on('draw.create', updatePolygonPoints);
            map.current?.on('draw.update', updatePolygonPoints);
            map.current?.on('draw.delete', () => setPolygonPoints([]));
            
            setMapInitialized(true);
          }).catch(err => {
            console.error('Error loading MapboxDraw:', err);
            toast({
              title: 'Error',
              description: 'Could not load map drawing tools',
              variant: 'destructive',
            });
          });
        });
      } catch (error) {
        console.error('Error initializing map:', error);
        toast({
          title: 'Map Error',
          description: 'Could not initialize map. Please check your access token.',
          variant: 'destructive',
        });
      }
    }
    
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapTab, toast]);

  // Update polygon points from draw
  const updatePolygonPoints = (e: any) => {
    if (e.features && e.features.length > 0) {
      const feature = e.features[0];
      if (feature.geometry && feature.geometry.coordinates && feature.geometry.coordinates.length > 0) {
        // Extract points from the first ring of coordinates
        const points = feature.geometry.coordinates[0].map((coord: [number, number]) => ({
          lng: coord[0],
          lat: coord[1]
        }));
        setPolygonPoints(points);
        
        // Update center coordinates based on polygon
        if (points.length > 0) {
          const sum = points.reduce((acc, point) => ({
            lng: acc.lng + point.lng,
            lat: acc.lat + point.lat
          }), { lng: 0, lat: 0 });
          
          const center = {
            lng: sum.lng / points.length,
            lat: sum.lat / points.length
          };
          
          setLatitude(center.lat.toString());
          setLongitude(center.lng.toString());
        }
      }
    }
  };

  // Display location on map
  const showLocationOnMap = (location: any) => {
    if (!map.current || !mapInitialized) return;
    
    setMapTab('map');
    
    // Clear existing drawings
    if (draw.current) {
      draw.current.deleteAll();
    }
    
    // Center map on location
    map.current.flyTo({
      center: [location.longitude, location.latitude],
      zoom: 14
    });
    
    // Add a marker
    new mapboxgl.Marker()
      .setLngLat([location.longitude, location.latitude])
      .addTo(map.current);
    
    // If we have polygon data, draw it
    if (location.polygonPoints && location.polygonPoints.length > 0) {
      try {
        const points = JSON.parse(location.polygonPoints);
        setPolygonPoints(points);
        
        // Create a polygon feature
        const feature = {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Polygon',
            coordinates: [points.map((p: Point) => [p.lng, p.lat])]
          }
        };
        
        // Add the feature to the draw plugin
        draw.current.add(feature);
      } catch (error) {
        console.error('Error parsing polygon points:', error);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !latitude || !longitude || !radius) {
      toast({
        title: 'Warning',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    const locationData = {
      name,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      radius: parseInt(radius),
      description,
      polygonPoints: polygonPoints.length > 0 ? JSON.stringify(polygonPoints) : null,
      createdAt: new Date().toISOString(),
    };

    if (isEditing && editingId) {
      updateLocationMutation.mutate({ id: editingId, data: locationData });
    } else {
      createLocationMutation.mutate(locationData);
    }
  };

  const handleEdit = (location: any) => {
    setName(location.name);
    setLatitude(location.latitude.toString());
    setLongitude(location.longitude.toString());
    setRadius(location.radius.toString());
    setDescription(location.description || '');
    setEditingId(location.id);
    setIsEditing(true);
    
    try {
      if (location.polygonPoints) {
        setPolygonPoints(JSON.parse(location.polygonPoints));
      }
    } catch (error) {
      console.error('Error parsing polygon points:', error);
    }
  };

  const resetForm = () => {
    setName('');
    setLatitude('');
    setLongitude('');
    setRadius('');
    setDescription('');
    setPolygonPoints([]);
    setEditingId(null);
    setIsEditing(false);
    
    // Clear any drawings
    if (draw.current) {
      draw.current.deleteAll();
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Location Management</h1>
      
      <Tabs defaultValue="list" value={mapTab} onValueChange={setMapTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="map">Map View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4">
              <Card>
                <CardHeader>
                  <CardTitle>{isEditing ? 'Update Location' : 'Create Location'}</CardTitle>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Location Name</Label>
                      <Input
                        id="name"
                        placeholder="Enter location name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Location description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={2}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="latitude">Latitude</Label>
                        <Input
                          id="latitude"
                          type="text"
                          placeholder="e.g., 37.7749"
                          value={latitude}
                          onChange={(e) => setLatitude(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="longitude">Longitude</Label>
                        <Input
                          id="longitude"
                          type="text"
                          placeholder="e.g., -122.4194"
                          value={longitude}
                          onChange={(e) => setLongitude(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="radius">Radius (meters)</Label>
                      <Input
                        id="radius"
                        type="number"
                        placeholder="Enter radius in meters"
                        value={radius}
                        onChange={(e) => setRadius(e.target.value)}
                        min="1"
                        required
                      />
                    </div>
                    
                    {polygonPoints.length > 0 && (
                      <div className="bg-slate-100 p-2 rounded-md">
                        <p className="text-sm text-slate-600">Polygon with {polygonPoints.length} points defined</p>
                      </div>
                    )}
                    
                    <div className="text-sm text-slate-500">
                      <p>Switch to Map View to draw location boundaries</p>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={resetForm} type="button">
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createLocationMutation.isPending || updateLocationMutation.isPending}
                    >
                      {(createLocationMutation.isPending || updateLocationMutation.isPending) && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {isEditing ? 'Update Location' : 'Create Location'}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </div>
            
            <div className="lg:col-span-8">
              <Card>
                <CardHeader>
                  <CardTitle>Locations</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : locations.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-md">
                      <MapPin className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                      <h3 className="text-lg font-medium text-gray-500">No locations found</h3>
                      <p className="text-gray-400">Create a location to get started</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Coordinates</TableHead>
                            <TableHead>Radius</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {locations.map((location: any) => (
                            <TableRow key={location.id}>
                              <TableCell className="font-medium">{location.name}</TableCell>
                              <TableCell>
                                <div className="flex items-center text-xs">
                                  <span className="whitespace-nowrap">
                                    Lat: {parseFloat(location.latitude).toFixed(4)}
                                  </span>
                                  <span className="mx-1">|</span>
                                  <span className="whitespace-nowrap">
                                    Lng: {parseFloat(location.longitude).toFixed(4)}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>{location.radius}m</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end space-x-2">
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => showLocationOnMap(location)}
                                  >
                                    <MapIcon className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleEdit(location)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => deleteLocationMutation.mutate(location.id)}
                                    disabled={deleteLocationMutation.isPending}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="map" className="mt-0">
          <div className="grid grid-cols-1 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Map View</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center mb-4 text-slate-600 text-sm bg-slate-50 p-2 rounded">
                  <p>
                    <span className="font-medium">Instructions:</span> Use the polygon tool to draw boundaries. 
                    Click points to create a shape, then click the first point to complete it.
                    Use the trash tool to delete your drawing.
                  </p>
                </div>
                <div 
                  ref={mapContainer} 
                  className="w-full h-[500px] rounded-md border border-slate-200"
                  style={{ minHeight: '500px' }}
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setMapTab('list')}>
                  Back to List
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={!name || !latitude || !longitude || !radius}
                >
                  {isEditing ? 'Update Location' : 'Save Location'}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LocationManagement;
