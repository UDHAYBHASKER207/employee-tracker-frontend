import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth-context';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock, CheckCircle, XCircle, BarChart } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as api from '@/lib/api';

function calculatePerformance(tasks) {
  if (!tasks || tasks.length === 0) return 0;
  const completed = tasks.filter(t => t.status === 'completed').length;
  return Math.round((completed / tasks.length) * 100);
}

const Attendance = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [date, setDate] = useState(new Date());
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [tasks, setTasks] = useState([]);
  const performance = calculatePerformance(tasks);
  const [employeeId, setEmployeeId] = useState(null);

  // Get today's attendance record
  const today = new Date().toISOString().split('T')[0];
  const todayAttendanceRecord = attendanceData.find(record => record.date === today);

  // Read tab from query string
  const params = new URLSearchParams(location.search);
  const defaultTab = params.get('tab') || 'attendance';

  // Fetch employee, tasks, and attendance
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
          return;
        }
        // Fetch the current employee from the backend
        const employee = await api.getCurrentEmployee(token);
        const empId = employee?._id;
        setEmployeeId(empId);
        if (!empId) return;
        // Fetch attendance
        const attendanceRecords = await api.getAttendance(empId, token);
        setAttendanceData(attendanceRecords);
        // Fetch tasks
        const fetchedTasks = await api.getTasks(empId, token);
        setTasks(fetchedTasks);
        // Set today's check-in/out if exists
        const todayRecord = attendanceRecords.find(r => r.date === today);
        setCheckInTime(todayRecord?.checkIn || null);
        setCheckOutTime(todayRecord?.checkOut || null);
      } catch (error) {
        if (error.message && error.message.toLowerCase().includes('jwt expired')) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/');
        } else if (error.message && error.message.toLowerCase().includes('jwt')) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        } else {
          toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
      }
    };
    fetchData();
  }, [toast, navigate]);

  // Function to handle check-in
  const handleCheckIn = async () => {
    try {
      const token = localStorage.getItem('token');
      await api.checkIn(employeeId, token);
      toast({
        title: 'Checked In',
        description: `You have checked in successfully.`,
      });
      // Refetch attendance
      const attendanceRecords = await api.getAttendance(employeeId, token);
      setAttendanceData(attendanceRecords);
      const today = new Date().toISOString().split('T')[0];
      const todayRecord = attendanceRecords.find(r => r.date === today);
      setCheckInTime(todayRecord?.checkIn || null);
      setCheckOutTime(todayRecord?.checkOut || null);
    } catch (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  // Function to handle check-out
  const handleCheckOut = async () => {
    try {
      const token = localStorage.getItem('token');
      await api.checkOut(employeeId, token);
      toast({
        title: 'Checked Out',
        description: `You have checked out successfully.`,
      });
      // Refetch attendance
      const attendanceRecords = await api.getAttendance(employeeId, token);
      setAttendanceData(attendanceRecords);
      const today = new Date().toISOString().split('T')[0];
      const todayRecord = attendanceRecords.find(r => r.date === today);
      setCheckInTime(todayRecord?.checkIn || null);
      setCheckOutTime(todayRecord?.checkOut || null);
    } catch (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  // Function to handle task status update
  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await api.updateTask(taskId, { status: newStatus }, token);
      // Refetch tasks from backend
      const employee = await api.getCurrentEmployee(token);
      const employeeId = employee?._id;
      if (!employeeId) return;
      const fetchedTasks = await api.getTasks(employeeId, token);
      setTasks(fetchedTasks);
      toast({
        title: "Task Updated",
        description: "Task status has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update task status.",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 animate-fade-in">
        <h1 className="text-3xl font-bold mb-6">Attendance & Tasks</h1>

        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
          </TabsList>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Today's Attendance Card */}
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Today's Attendance
                  </CardTitle>
                  <CardDescription>
                    {format(new Date(), 'EEEE, MMMM d, yyyy')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Check In</p>
                        <p className="text-lg">{checkInTime || '–'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Check Out</p>
                        <p className="text-lg">{checkOutTime || '–'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-muted-foreground mr-2">Status:</span>
                      {todayAttendanceRecord?.status === 'present' ? (
                        <span className="flex items-center text-green-600 font-semibold">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Present
                        </span>
                      ) : (
                        <span className="flex items-center text-red-600 font-semibold">
                          <XCircle className="h-4 w-4 mr-1" />
                          Absent
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Button 
                        onClick={handleCheckIn} 
                        disabled={!!checkInTime || !!todayAttendanceRecord?.checkOut}
                        className="w-full"
                      >
                        Check In
                      </Button>
                      <Button 
                        onClick={handleCheckOut} 
                        disabled={!checkInTime || !!checkOutTime}
                        variant="outline"
                        className="w-full"
                      >
                        Check Out
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Calendar Card */}
              <Card className="col-span-1 md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    Attendance Calendar
                  </CardTitle>
                  <CardDescription>
                    View and manage your attendance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border mx-auto"
                  />
                </CardContent>
              </Card>

              {/* Attendance History Card */}
              <Card className="col-span-1 md:col-span-3">
                <CardHeader>
                  <CardTitle>Attendance History</CardTitle>
                  <CardDescription>Your recent attendance records</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <div className="grid grid-cols-4 bg-muted py-3 px-4 text-sm font-medium">
                      <div>Date</div>
                      <div>Check In</div>
                      <div>Check Out</div>
                      <div>Status</div>
                    </div>
                    <div className="divide-y">
                      {attendanceData.map((record) => (
                        <div key={record._id || record.date} className="grid grid-cols-4 py-3 px-4">
                          <div>{new Date(record.date).toLocaleDateString()}</div>
                          <div>{record.checkIn || '–'}</div>
                          <div>{record.checkOut || '–'}</div>
                          <div className="flex items-center">
                            {record.status === 'present' ? (
                              <span className="flex items-center text-green-600">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Present
                              </span>
                            ) : (
                              <span className="flex items-center text-red-600">
                                <XCircle className="h-4 w-4 mr-1" />
                                Absent
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-6">
            <div className="mb-4 font-semibold">
              Performance: <span className="text-primary">{performance}%</span>
            </div>
            <div className="mb-4 font-semibold">Total Assigned Tasks: {tasks.length}</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Tasks Summary Card */}
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart className="h-5 w-5" />
                    Tasks Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Not Started</span>
                      <span className="text-sm font-medium">
                        {tasks.filter(t => t.status === 'not-started').length}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-red-400" 
                        style={{ width: `${tasks.filter(t => t.status === 'not-started').length / tasks.length * 100}%` }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">In Progress</span>
                      <span className="text-sm font-medium">
                        {tasks.filter(t => t.status === 'in-progress').length}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-400" 
                        style={{ width: `${tasks.filter(t => t.status === 'in-progress').length / tasks.length * 100}%` }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Completed</span>
                      <span className="text-sm font-medium">
                        {tasks.filter(t => t.status === 'completed').length}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-400" 
                        style={{ width: `${tasks.filter(t => t.status === 'completed').length / tasks.length * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Task List Card */}
              <Card className="col-span-1 md:col-span-2">
                <CardHeader>
                  <CardTitle>My Tasks</CardTitle>
                  <CardDescription>Your assigned tasks and their status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tasks.map(task => (
                      <div key={task._id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium">{task.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <select
                              value={task.status}
                              onChange={(e) => updateTaskStatus(task._id, e.target.value)}
                              className="text-sm border rounded px-2 py-1"
                            >
                              <option value="not-started">Not Started</option>
                              <option value="in-progress">In Progress</option>
                              <option value="completed">Completed</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Attendance; 