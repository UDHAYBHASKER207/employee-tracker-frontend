import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Save, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getEmployee, updateEmployee, departments, positions } from '@/lib/data';

// Form field configurations
const formFields = {
  personalInfo: [
    { 
      name: 'firstName', 
      label: 'First Name', 
      type: 'input',
      required: true 
    },
    { 
      name: 'lastName', 
      label: 'Last Name', 
      type: 'input',
      required: true 
    }
  ],
  contactInfo: [
    { 
      name: 'email', 
      label: 'Email', 
      type: 'input', 
      inputType: 'email',
      required: true 
    },
    {
      name: 'phone',
      label: 'Phone Number',
      type: 'input',
      required: false
    }
  ],
  employmentInfo: [
    { 
      name: 'department', 
      label: 'Department', 
      type: 'select',
      options: departments,
      getOptionLabel: (opt) => opt.name,
      getOptionValue: (opt) => opt.id,
      required: true
    },
    { 
      name: 'position', 
      label: 'Position', 
      type: 'select',
      options: positions,
      getOptionLabel: (opt) => opt.name,
      getOptionValue: (opt) => opt.id,
      required: false
    }
  ],
  additionalInfo: [
    {
      name: 'hireDate',
      label: 'Hire Date',
      type: 'input',
      inputType: 'date',
      required: false
    },
    {
      name: 'salary',
      label: 'Salary',
      type: 'input',
      inputType: 'number',
      required: false
    }
  ],
  statusInfo: [
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { id: 'active', name: 'Active' },
        { id: 'inactive', name: 'Inactive' }
      ],
      getOptionLabel: (opt) => opt.name,
      getOptionValue: (opt) => opt.id,
      required: false
    }
  ]
};

const EditEmployee = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [employee, setEmployee] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    hireDate: '',
    salary: 0,
    status: 'active'
  });

  const selectedDepartment = employee.department; // Get selected department from state

  const filteredPositions = selectedDepartment
    ? positions.filter(pos => pos.department === selectedDepartment)
    : [];

  useEffect(() => {
    const loadEmployee = async () => {
      try {
        const data = await getEmployee(id);
        if (data) {
          setEmployee({
            ...data,
            hireDate: data.hireDate ? new Date(data.hireDate).toISOString().split('T')[0] : '',
            salary: data.salary || 0
          });
        } else {
          toast({
            title: 'Error',
            description: 'Employee not found',
            variant: 'destructive',
          });
          navigate('/admin/employees');
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load employee data',
          variant: 'destructive',
        });
        navigate('/admin/employees');
      }
    };

    loadEmployee();
  }, [id, navigate, toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateEmployee(id, employee);
      toast({
        title: 'Success',
        description: 'Employee updated successfully',
      });
      navigate('/admin/employees');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update employee',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field) => (value) => {
    setEmployee(prev => {
      const newState = {
        ...prev,
        [field]: field === 'salary' ? parseFloat(value) || 0 : value
      };
      if (field === 'department') {
        newState.position = ''; // Clear position when department changes
      }
      return newState;
    });
  };

  const renderField = (field) => {
    let value = employee[field.name];
    if (field.inputType === 'number') value = value ?? 0;
    else value = value || '';
    switch (field.type) {
      case 'input':
        return (
          <Input
            id={field.name}
            name={field.name}
            type={field.inputType || 'text'}
            value={value}
            onChange={(e) => handleChange(field.name)(e.target.value)}
            required={field.required}
          />
        );
      case 'select':
        return (
          <Select
            value={value}
            onValueChange={handleChange(field.name)}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options.map((option) => (
                <SelectItem 
                  key={field.getOptionValue(option)} 
                  value={field.getOptionValue(option)}
                >
                  {field.getOptionLabel(option)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      default:
        return null;
    }
  };

  const renderFieldGroup = (fields) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {fields.map((field) => (
        <div key={field.name} className="space-y-2">
          <label htmlFor={field.name} className="text-sm font-medium">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {renderField(field)}
        </div>
      ))}
    </div>
  );

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
            <CardTitle className="text-2xl">Edit Employee</CardTitle>
            <CardDescription>
              Update employee information in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {renderFieldGroup(formFields.personalInfo)}
              {renderFieldGroup(formFields.contactInfo)}
              {/* Manually render department and position to allow dynamic filtering */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="department" className="text-sm font-medium">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <Select
                    onValueChange={handleChange('department')}
                    value={employee.department || ''}
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
                    onValueChange={handleChange('position')}
                    value={employee.position || ''}
                    disabled={!selectedDepartment}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        !selectedDepartment
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
              </div>
              {renderFieldGroup(formFields.additionalInfo)}
              {renderFieldGroup(formFields.statusInfo)}

              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/admin/employees')}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
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

export default EditEmployee; 