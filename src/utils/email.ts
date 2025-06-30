
/**
 * Email utility for sending notifications
 * In production, this would integrate with a real email service
 * For now, we'll mock the email sending functionality
 */

export const sendEmail = async (to: string, subject: string, content: string): Promise<boolean> => {
  //console.log('Sending email to:', to);
  //console.log('Subject:', subject);
  //console.log('Content:', content);
  
  // In a real app, this would use an email service like Sendgrid, AWS SES, etc.
  // For now we'll simulate a successful email send and show in console
  return true;
};

export const sendCredentialsEmail = async (
  email: string, 
  name: string, 
  userId: string, 
  password: string
): Promise<boolean> => {
  const subject = 'Your ShiftTrack Account Credentials';
  
  const content = `
    Hello ${name},
    
    Your account has been created. Below are your login credentials:
    
    User ID: ${userId}
    Password: ${password}
    
    Please login at our platform and change your password on first login.
    
    Best regards,
    ShiftTrack HR Team
  `;
  
  return sendEmail(email, subject, content);
};

export const sendRegistrationApprovalEmail = async (
  email: string,
  name: string
): Promise<boolean> => {
  const subject = 'ShiftTrack HR - Registration Approved';
  
  const content = `
    Hello ${name},
    
    Good news! Your registration for ShiftTrack HR has been approved.
    You can now log in with your credentials and access the system.
    
    Best regards,
    ShiftTrack HR Team
  `;
  
  return sendEmail(email, subject, content);
};

export const sendRegistrationRejectionEmail = async (
  email: string,
  name: string,
  reason: string = 'Your registration did not meet our current requirements.'
): Promise<boolean> => {
  const subject = 'ShiftTrack HR - Registration Status Update';
  
  const content = `
    Hello ${name},
    
    We regret to inform you that your registration for ShiftTrack HR has been declined.
    
    Reason: ${reason}
    
    If you believe this is an error, please contact your HR representative.
    
    Best regards,
    ShiftTrack HR Team
  `;
  
  return sendEmail(email, subject, content);
};

export const sendProjectAssignmentEmail = async (
  email: string,
  name: string,
  projectName: string,
  designation: string
): Promise<boolean> => {
  const subject = 'ShiftTrack HR - Project Assignment';
  
  const content = `
    Hello ${name},
    
    You have been assigned to the project "${projectName}" as ${designation}.
    
    Please check your dashboard for more details about this project.
    
    Best regards,
    ShiftTrack HR Team
  `;
  
  return sendEmail(email, subject, content);
};

export const sendLeaveRequestEmail = async (
  adminEmail: string,
  employeeName: string,
  leaveType: string,
  startDate: string,
  endDate: string,
  reason: string
): Promise<boolean> => {
  const subject = 'ShiftTrack HR - Leave Request';
  
  const content = `
    Dear Admin,
    
    A new leave request has been submitted by ${employeeName}.
    
    Leave Type: ${leaveType}
    Start Date: ${startDate}
    End Date: ${endDate}
    Reason: ${reason}
    
    Please review this request at your earliest convenience.
    
    Best regards,
    ShiftTrack HR System
  `;
  
  return sendEmail(adminEmail, subject, content);
};

export const sendLeaveStatusEmail = async (
  email: string,
  name: string,
  status: 'approved' | 'rejected',
  leaveType: string,
  startDate: string,
  endDate: string,
  reason?: string
): Promise<boolean> => {
  const subject = `ShiftTrack HR - Leave Request ${status.charAt(0).toUpperCase() + status.slice(1)}`;
  
  let content = `
    Hello ${name},
    
    Your leave request for ${leaveType} from ${startDate} to ${endDate} has been ${status}.
  `;
  
  if (status === 'rejected' && reason) {
    content += `\n    Reason: ${reason}`;
  }
  
  content += `
    
    Best regards,
    ShiftTrack HR Team
  `;
  
  return sendEmail(email, subject, content);
};

export const sendDepartmentAssignmentEmail = async (
  email: string,
  name: string,
  departmentName: string
): Promise<boolean> => {
  const subject = 'ShiftTrack HR - Department Assignment';
  
  const content = `
    Hello ${name},
    
    You have been assigned to the department "${departmentName}".
    
    Please check your dashboard for more details.
    
    Best regards,
    ShiftTrack HR Team
  `;
  
  return sendEmail(email, subject, content);
};

export const sendDesignationAssignmentEmail = async (
  email: string,
  name: string,
  designation: string
): Promise<boolean> => {
  const subject = 'ShiftTrack HR - Designation Update';
  
  const content = `
    Hello ${name},
    
    Your designation has been updated to "${designation}".
    
    Best regards,
    ShiftTrack HR Team
  `;
  
  return sendEmail(email, subject, content);
};

export default {
  sendEmail,
  sendCredentialsEmail,
  sendRegistrationApprovalEmail,
  sendRegistrationRejectionEmail,
  sendProjectAssignmentEmail,
  sendLeaveRequestEmail,
  sendLeaveStatusEmail,
  sendDepartmentAssignmentEmail,
  sendDesignationAssignmentEmail
};
