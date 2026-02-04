import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { getEmployee, getDepartmentName, getPositionName, updateEmployee } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { 
  Loader2, Save, Edit, Calendar, DollarSign, Building, Briefcase, 
  Mail, Phone, Clock, CheckCircle, XCircle, FileText, Bell, 
  User, Lock, ListTodo, ClipboardList, MessageSquare
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import * as api from '@/lib/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';

// Helper to check if a string is a valid MongoDB ObjectId
function isValidObjectId(id) {
  return typeof id === 'string' && id.length === 24 && /^[a-fA-F0-9]+$/.test(id);
}

// Helper to calculate performance percentage
function calculatePerformance(tasks) {
  if (!tasks || tasks.length === 0) return 0;
  const completed = tasks.filter(t => t.status === 'completed').length;
  return Math.round((completed / tasks.length) * 100);
}

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const { data: employee, isLoading, error } = useQuery({
    queryKey: ['employee', user?._id],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');
      const employeeData = await api.getCurrentEmployee(token);
      
      // Fetch related data (attendance, tasks, activities, announcements) once employee data is available
      const empId = employeeData?._id;
      if (!empId) return employeeData; // Return employeeData even if no ID, or handle as needed

      const [fetchedAttendance, fetchedTasks, fetchedActivities, fetchedAnnouncements] = await Promise.all([
        api.getAttendance?.(empId, token) || [],
        isValidObjectId(empId) ? api.getTasks(empId, token) : [],
        api.getActivities?.(empId, token) || [],
        api.getAnnouncements(token)
      ]);

      return { // Return a combined object with all fetched data
        ...employeeData,
        attendanceData: fetchedAttendance,
        tasks: fetchedTasks,
        activities: fetchedActivities,
        announcements: fetchedAnnouncements,
      };
    },
    enabled: !!user?._id, // Only run query if user ID is available
    staleTime: 5 * 60 * 1000, // Data considered fresh for 5 minutes
    onError: (err) => {
      console.error('Error fetching employee data in Dashboard:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to fetch your profile data. Please try logging out and back in.',
        variant: 'destructive',
      });
      // Handle JWT expiry/malformed tokens if not already handled by api.js
      if (err.message && err.message.toLowerCase().includes('jwt expired')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/'); // Redirect to landing page
      } else if (err.message && err.message.toLowerCase().includes('jwt')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login'); // Redirect to login
      }
    },
  });

  // Destructure combined data from employee object
  const { attendanceData = [], tasks = [], activities = [], announcements = [] } = employee || {};

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
  });
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!employee) return;

    setIsSaving(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const updatedEmployee = await api.updateEmployee(employee._id || employee.id, formData, token);
      // After successful update, react-query will automatically re-fetch via queryClient.invalidateQueries
      // No need to set employee state manually here

      toast({
        title: 'Success',
        description: 'Your profile has been updated',
      });
      setIsEditing(false); // Assuming you want to exit edit mode

    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update your profile',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <span className="ml-2">Loading your profile...</span>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <Card className="bg-white shadow-sm">
            <CardContent className="pt-6 pb-6 text-center">
              <p className="text-red-500">Error loading profile: {error.message}. Please try again.</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!employee) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <Card className="bg-white shadow-sm">
            <CardContent className="pt-6 pb-6 text-center">
              <p>No employee profile found. Please contact your administrator.</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // Get employee ID safely
  const employeeId = employee._id || employee.id || '';
  const shortId = employeeId.toString().substring(0, 5);

  // Get today's attendance record
  const today = new Date().toISOString().split('T')[0];
  const todayAttendanceRecord = attendanceData.find(record => record.date === today);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-7xl animate-fade-in">
        <h1 className="text-3xl font-bold mb-6">Employee Dashboard</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Personal Information Section */}
          <div className="lg:col-span-1">
            <Card className="bg-white shadow-sm h-full">
              <CardHeader className="pb-2">
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="pt-2 pb-6 flex flex-col items-center justify-center">
                <div className="w-32 h-32 mb-4 overflow-hidden rounded-full border-4 border-white shadow-sm">
                  <img 
                    src={employee.image || 'https://randomuser.me/api/portraits/lego/1.jpg'} 
                    alt={`${employee.firstName || ''} ${employee.lastName || ''}`} 
                    className="w-full h-full object-cover"
                    key={employee.image}
                  />
                </div>
                <h2 className="text-xl font-semibold mt-2">{employee.firstName || ''} {employee.lastName || ''}</h2>
                <div className="text-muted-foreground mb-1 flex items-center">
                  <Badge variant="outline" className="mr-1">ID: EMP-{shortId}</Badge>
                </div>
                <p className="text-muted-foreground">{getPositionName(employee.position || '')}</p>
                <div className="mt-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                  {getDepartmentName(employee.department || '')}
                </div>
                
                <div className="mt-4 space-y-2 w-full">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-muted-foreground mr-2" />
                    <span className="text-sm">{employee.email || ''}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-muted-foreground mr-2" />
                    <span className="text-sm">{employee.phone || ''}</span>
                  </div>
                </div>
                
                <div className="mt-4 w-full">
                  <Link to="/employee/profile/edit">
                    <Button variant="outline" size="sm" className="w-full">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 gap-6">
              {/* Work Summary Section */}
              <Card className="bg-white shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle>Work Summary</CardTitle>
                  <CardDescription>Your current work status and metrics</CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col p-4 bg-slate-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-medium text-muted-foreground">Attendance Status</h3>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex items-center">
                        {todayAttendanceRecord?.status === "present" ? (
                          <>
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                            <span className="font-medium text-green-500">Present</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-5 w-5 text-red-500 mr-2" />
                            <span className="font-medium text-red-500">Absent</span>
                          </>
                        )}
                      </div>
                      <Link to="/employee/attendance" className="mt-4 text-xs text-primary hover:underline self-end">
                        View Attendance History
                      </Link>
                    </div>
                    
                    <div className="flex flex-col p-4 bg-slate-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-medium text-muted-foreground">Assigned Tasks</h3>
                        <ListTodo className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="text-2xl font-bold">{tasks.length}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {tasks.filter(t => t.status === "in-progress").length} in progress
                      </div>
                      <Link
                        to="#"
                        onClick={e => {
                          e.preventDefault();
                          navigate('/employee/attendance?tab=tasks');
                        }}
                        className="mt-4 text-xs text-primary hover:underline self-end"
                      >
                        View All Tasks
                      </Link>
                    </div>
                    
                    <div className="flex flex-col p-4 bg-slate-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-medium text-muted-foreground">Performance</h3>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="text-2xl font-bold">{calculatePerformance(tasks)}%</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {tasks.length === 0 ? 'No tasks assigned' : `${tasks.filter(t => t.status === 'completed').length} completed, ${tasks.filter(t => t.status === 'in-progress').length} in progress`}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tasks Summary Section */}
              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle>Tasks Summary</CardTitle>
                  <CardDescription>Overview of your task statuses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-col">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Not Started</span>
                        <span className="text-sm text-muted-foreground">{tasks.filter(t => t.status === 'pending').length}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">In Progress</span>
                        <span className="text-sm text-muted-foreground">{tasks.filter(t => t.status === 'in-progress').length}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Completed</span>
                        <span className="text-sm text-muted-foreground">{tasks.filter(t => t.status === 'completed').length}</span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Overall Progress</h3>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                        <div 
                          className="bg-primary h-2.5 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${calculatePerformance(tasks)}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-muted-foreground text-right mt-1">
                        {calculatePerformance(tasks)}% Completed
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Assigned Tasks Section */}
              <Card className="bg-white shadow-sm mt-6">
                <CardHeader>
                  <CardTitle>Assigned Tasks</CardTitle>
                  <CardDescription>Tasks assigned to you by your manager/admin</CardDescription>
                </CardHeader>
                <CardContent>
                  {tasks.length === 0 ? (
                    <div className="text-muted-foreground">No tasks assigned yet.</div>
                  ) : (
                    <div className="space-y-4">
                      {tasks.map(task => (
                        <div key={task._id} className="p-3 border rounded-md flex flex-col md:flex-row md:items-center md:justify-between bg-slate-50">
                          <div>
                            <div className="font-medium text-lg">{task.title}</div>
                            <div className="text-sm text-muted-foreground mb-1">{task.description}</div>
                            <div className="text-xs text-muted-foreground">Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</div>
                          </div>
                          <div className="mt-2 md:mt-0 flex items-center gap-2">
                            <Badge variant={task.status === 'completed' ? 'success' : task.status === 'in-progress' ? 'default' : 'outline'}>
                              {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Activity Section */}
              <Card className="bg-white shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your recent actions and notifications</CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  {activities.length > 0 ? (
                    <div className="space-y-4">
                      {activities.map((activity) => (
                        <div key={activity._id} className="flex items-start border-b border-border pb-3 last:border-0 last:pb-0">
                          {activity.type === "login" && <Clock className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />}
                          {activity.type === "profile_update" && <User className="h-5 w-5 text-green-500 mr-3 mt-0.5" />}
                          {activity.type === "task_completed" && <ListTodo className="h-5 w-5 text-purple-500 mr-3 mt-0.5" />}
                          {activity.type === "attendance_checkin" && <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />}
                          {activity.type === "attendance_checkout" && <XCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5" />}
                          {activity.type === "password_change" && <Lock className="h-5 w-5 text-yellow-500 mr-3 mt-0.5" />}
                          {activity.type === "admin_action" && <User className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />}
                          <div className="flex-1">
                            <p className="text-sm">{activity.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(activity.date).toLocaleDateString()} at {new Date(activity.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No recent activities.</p>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions & Additional Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Quick Actions Section */}
                <Card className="bg-white shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="grid grid-cols-1 gap-2">
                      <Link to="/employee/profile">
                        <Button variant="outline" className="w-full justify-start">
                          <User className="h-4 w-4 mr-2" />
                          View Profile
                        </Button>
                      </Link>
                      <Link to="/employee/profile/edit">
                        <Button variant="outline" className="w-full justify-start">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Profile
                        </Button>
                      </Link>
                      <Link to="/employee/change-password">
                        <Button variant="outline" className="w-full justify-start">
                          <Lock className="h-4 w-4 mr-2" />
                          Change Password
                        </Button>
                      </Link>
                      <Link to="/employee/attendance">
                        <Button variant="outline" className="w-full justify-start">
                          <ClipboardList className="h-4 w-4 mr-2" />
                          View Attendance
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                {/* Announcements Section */}
                <Card className="bg-white shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle>Announcements</CardTitle>
                    <CardDescription>Messages from administration</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2">
                    {announcements?.length > 0 ? (
                      <div className="space-y-4">
                        {announcements.map(announcement => (
                          <div key={announcement._id} className="flex items-start pb-2">
                            <MessageSquare className="h-5 w-5 text-primary mr-3 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium">{announcement.title}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {new Date(announcement.createdAt).toLocaleDateString()}
                              </p>
                              <p className="text-sm mt-1">{announcement.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No announcements at this time.</p>
                    )}
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button variant="link" className="p-0 h-auto">View all announcements</Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EmployeeDashboard; 