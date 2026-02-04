import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getEmployees } from '@/lib/data';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, ArrowLeft } from 'lucide-react';

const AssignTask = () => {
  const [employees, setEmployees] = useState([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [taskForm, setTaskForm] = useState({
    assignedTo: '',
    title: '',
    description: '',
    dueDate: '',
  });
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const data = await getEmployees();
        setEmployees(data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch employee data',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingEmployees(false);
      }
    };

    fetchEmployees();
  }, [toast]);

  const handleTaskFormChange = (e) => {
    const { name, value } = e.target;
    setTaskForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAssignTask = async (e) => {
    e.preventDefault();
    setIsAssigning(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(taskForm),
      });
      if (!response.ok) throw new Error((await response.json()).message || 'Failed to assign task');
      toast({ title: 'Success', description: 'Task assigned successfully!' });
      setTaskForm({ assignedTo: '', title: '', description: '', dueDate: '' }); // Clear form
    } catch (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-2xl animate-fade-in">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Assign New Task</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Task Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAssignTask} className="space-y-6">
              <div>
                <label htmlFor="assignedTo" className="block mb-2 font-medium">Assign To</label>
                <select
                  id="assignedTo"
                  name="assignedTo"
                  value={taskForm.assignedTo}
                  onChange={handleTaskFormChange}
                  required
                  className="w-full p-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  disabled={isLoadingEmployees}
                >
                  <option value="">
                    {isLoadingEmployees ? 'Loading employees...' : 'Select employee'}
                  </option>
                  {employees.map(emp => (
                    <option key={emp._id} value={emp._id}>
                      {emp.firstName} {emp.lastName} ({emp.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="title" className="block mb-2 font-medium">Task Title</label>
                <Input 
                  id="title"
                  name="title" 
                  value={taskForm.title} 
                  onChange={handleTaskFormChange} 
                  required 
                />
              </div>

              <div>
                <label htmlFor="description" className="block mb-2 font-medium">Description</label>
                <Textarea 
                  id="description"
                  name="description" 
                  value={taskForm.description} 
                  onChange={handleTaskFormChange} 
                />
              </div>

              <div>
                <label htmlFor="dueDate" className="block mb-2 font-medium">Due Date</label>
                <Input 
                  id="dueDate"
                  type="date" 
                  name="dueDate" 
                  value={taskForm.dueDate} 
                  onChange={handleTaskFormChange} 
                />
              </div>

              <div className="flex justify-end gap-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isAssigning || isLoadingEmployees}
                >
                  {isAssigning ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Assign Task
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AssignTask; 