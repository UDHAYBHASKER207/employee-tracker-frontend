import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Save, ArrowLeft } from 'lucide-react';
import * as api from '@/lib/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const profileFormSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters" }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().min(5, { message: "Please enter a valid phone number" }),
  image: z.any().optional(),
  department: z.string().optional(),
  position: z.string().optional(),
});

const EditProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch employee data
  const { data: employee, isLoading } = useQuery({
    queryKey: ['employee', user?._id],
    queryFn: () => api.getCurrentEmployee(localStorage.getItem('token')),
    enabled: !!user?._id,
  });

  // Set up form with react-hook-form
  const form = useForm({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      image: undefined,
      department: '',
      position: '',
    },
    values: employee ? {
      firstName: employee.firstName || '',
      lastName: employee.lastName || '',
      email: employee.email || '',
      phone: employee.phone || '',
      image: undefined,
      department: employee.department || '',
      position: employee.position || '',
    } : undefined,
  });

  const selectedDepartment = form.watch('department');
  const filteredPositions = selectedDepartment 
    ? api.positions.filter(pos => pos.department === selectedDepartment)
    : [];

  useEffect(() => {
    if (employee && selectedDepartment && !filteredPositions.some(pos => pos.id === form.getValues('position'))) {
      form.setValue('position', '');
    }
  }, [selectedDepartment, filteredPositions, form, employee]);

  // Update employee mutation
  const mutation = useMutation({
    mutationFn: async (data) => {
      if (!employee?._id) throw new Error("Employee ID not found");
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      console.log('Form data before processing:', data);

      const formData = new FormData();
      
      // Append all form fields to FormData
      Object.keys(data).forEach(key => {
        if (key === 'image' && data[key]?.[0]) {
          console.log('Appending image file:', data[key][0]);
          formData.append('image', data[key][0]);
        } else if (data[key] !== undefined) {
          console.log(`Appending ${key}:`, data[key]);
          formData.append(key, data[key]);
        }
      });

      // Log the FormData contents for debugging
      console.log('FormData contents:');
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      try {
        const result = await api.updateEmployee(employee._id, formData, token);
        console.log('Update result:', result);
        return result;
      } catch (error) {
        console.error('Update error:', error);
        throw error;
      }
    },
    onSuccess: (updatedEmployee) => {
      console.log('Mutation successful, updated employee:', updatedEmployee);
      // Invalidate and refetch employee data
      queryClient.invalidateQueries({ queryKey: ['employee', user?._id] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      navigate('/employee/profile');
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      toast({
        title: "Failed to update profile",
        description: error.message || "There was an error updating your profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data) => {
    console.log('Form data being submitted:', data);
    mutation.mutate(data);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-muted-foreground">Loading profile data...</p>
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
      <div className="container mx-auto px-4 py-8 max-w-3xl animate-fade-in">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Edit Profile</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" disabled={true} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field: { value, onChange, ...field } }) => (
                      <FormItem>
                        <FormLabel>Profile Image</FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => onChange(e.target.files)}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
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
                    disabled={mutation.isPending}
                  >
                    {mutation.isPending ? (
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
            </Form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default EditProfile; 