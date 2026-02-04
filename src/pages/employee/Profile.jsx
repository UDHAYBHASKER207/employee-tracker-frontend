import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { useQuery } from '@tanstack/react-query';
import { getEmployee, getDepartmentName, getPositionName, getEmployees } from '@/lib/data';
import { Mail, Phone, Calendar, Building, Briefcase, Edit, User } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  
  const { data: employee, isLoading } = useQuery({
    queryKey: ['employee', user?.email, user?._id],
    queryFn: async () => {
      const employees = await getEmployees();
      let employeeData = employees.find(emp => emp.email && user?.email && emp.email.toLowerCase() === user.email.toLowerCase());
      if (!employeeData && user?._id) {
        employeeData = employees.find(emp => emp.userId === user._id);
      }
      if (!employeeData) {
        throw new Error('No employee profile found');
      }
      return employeeData;
    },
    enabled: !!user?.email || !!user?._id,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!employee) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center">Employee profile not found.</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Profile</h1>
          <Link to="/employee/profile/edit">
            <Button variant="outline" className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Edit Profile
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Image Card */}
          <Card className="md:col-span-1">
            <CardContent className="pt-6 flex flex-col items-center">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-background shadow-sm mb-4">
                <img 
                  src={employee.image || "https://randomuser.me/api/portraits/lego/1.jpg"} 
                  alt={`${employee.firstName} ${employee.lastName}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="text-xl font-semibold">{employee.firstName} {employee.lastName}</h2>
              <p className="text-muted-foreground">{getPositionName(employee.position)}</p>
              <div className="mt-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                {getDepartmentName(employee.department)}
              </div>
            </CardContent>
          </Card>

          {/* Profile Details Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                    <p>{employee.firstName} {employee.lastName}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p>{employee.email}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Phone</p>
                    <p>{employee.phone}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Hire Date</p>
                    <p>{new Date(employee.hireDate).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Building className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Department</p>
                    <p>{getDepartmentName(employee.department)}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Position</p>
                    <p>{getPositionName(employee.position)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Profile; 