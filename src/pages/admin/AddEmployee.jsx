import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { addEmployee, departments, positions } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Save, Info } from 'lucide-react';

const DEFAULT_PASSWORD = 'Welcome123!'; // Default password for new employees

const AddEmployee = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    hireDate: new Date().toISOString().split('T')[0],
    salary: 0,
    status: 'active',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'salary' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const filteredPositions = positions.filter(
    (pos) => !formData.department || pos.department === formData.department
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Simple validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.department) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // First create the user account
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        role: 'employee',
        password: DEFAULT_PASSWORD
      };

      // Create user account
      const newUser = await signup(userData);

      if (!newUser || !(newUser._id || newUser.id)) {
        throw new Error('Failed to create user account');
      }

      // Get the token from the signup response
      const token = newUser.token;

      // Then create the employee record
      const employeeData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        department: formData.department,
        position: formData.position,
        hireDate: formData.hireDate,
        salary: parseFloat(formData.salary) || 0,
        status: formData.status || 'active',
        userId: newUser._id
      };

      // Add employee using the token from signup
      const newEmployee = await addEmployee(employeeData, token);
      
      if (!newEmployee || !newEmployee._id) {
        throw new Error('Failed to create employee profile');
      }

      toast({
        title: 'Success',
        description: `Employee has been successfully added.\n\nLogin credentials:\nEmail: ${formData.email}\nPassword: ${DEFAULT_PASSWORD}\n\nPlease share these credentials with the employee.`,
        duration: 8000,
      });
      
      navigate('/admin/employees');
    } catch (error) {
      console.error('Error creating employee:', error, error?.response?.data || error?.message);
      const errorMessage = error.message && error.message.toLowerCase().includes('duplicate') 
        ? 'An employee with this email already exists.'
        : error.message || 'Failed to add employee';
        
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl animate-fade-in">
        <Button 
          variant="ghost" 
          className="mb-4"
          onClick={() => navigate('/admin/employees')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Employees
        </Button>
        
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Add New Employee</CardTitle>
            <CardDescription>
              Fill in the details to add a new employee to the system
            </CardDescription>
            <div className="mt-2 flex items-center text-sm text-muted-foreground bg-blue-50 p-3 rounded-md">
              <Info className="h-4 w-4 mr-2 text-blue-500" />
              New employees can log in using their email and the default password: {DEFAULT_PASSWORD}
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-medium">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName || ''}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-medium">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName || ''}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium">
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="department" className="text-sm font-medium">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <Select
                    onValueChange={(value) => handleSelectChange('department', value)}
                    value={formData.department || ''}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="position" className="text-sm font-medium">
                    Position
                  </label>
                  <Select
                    onValueChange={(value) => handleSelectChange('position', value)}
                    value={formData.position || ''}
                    disabled={!formData.department}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        !formData.department 
                          ? "Select department first" 
                          : "Select position"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredPositions.map((pos) => (
                        <SelectItem key={pos.id} value={pos.id}>
                          {pos.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="hireDate" className="text-sm font-medium">
                    Hire Date
                  </label>
                  <Input
                    id="hireDate"
                    name="hireDate"
                    type="date"
                    value={formData.hireDate || ''}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="salary" className="text-sm font-medium">
                    Salary
                  </label>
                  <Input
                    id="salary"
                    name="salary"
                    type="number"
                    value={formData.salary ?? 0}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="status" className="text-sm font-medium">
                    Status
                  </label>
                  <Select
                    onValueChange={(value) => handleSelectChange('status', value)}
                    value={formData.status || 'active'}
                    defaultValue="active"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/admin/employees')}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Add Employee
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

// Example signup function
export async function signup(userData) {
  const res = await fetch('http://localhost:5000/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  if (!res.ok) throw new Error('Signup failed');
  return await res.json();
}

export default AddEmployee;