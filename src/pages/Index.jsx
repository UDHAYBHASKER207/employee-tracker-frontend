import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import { ChevronRight, Users, Briefcase, LineChart, CheckCircle, Shield } from 'lucide-react';

const features = [
  {
    title: 'Easy Employee Management',
    description: 'Add, update, and organize employee information with just a few clicks.',
    icon: Users
  },
  {
    title: 'Role-Based Access',
    description: 'Different access levels for admins and employees to maintain security.',
    icon: Shield
  },
  {
    title: 'Attendance Tracking',
    description: 'Keep track of employee attendance and working hours efficiently.',
    icon: CheckCircle
  },
  {
    title: 'Department Management',
    description: 'Organize employees into departments for better structure.',
    icon: Briefcase
  },
  {
    title: 'Performance Analytics',
    description: 'Get insights into employee performance and attendance patterns.',
    icon: LineChart
  }
];

const Index = () => {
  return (
    <Layout>
      <section className="pt-20 pb-16 md:pt-28 md:pb-24 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="flex-1 md:max-w-xl animate-slide-up">
              <span className="bg-primary/10 text-primary text-sm font-medium px-3 py-1 rounded-full mb-4 inline-block">
                Simple &amp; Intuitive
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Manage Your Team <span className="text-primary">Effortlessly</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Streamline employee management with our intuitive tracker. Add, update, and organize your team information all in one place.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/signup">
                  <Button size="lg" className="w-full sm:w-auto shadow-md hover:shadow-lg transition-shadow">
                    Get Started Free
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Log In
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex-1 animate-fade-in">
              <div className="glass rounded-2xl p-1 border border-white/20 shadow-xl">
                <img 
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80" 
                  alt="Employee Dashboard" 
                  className="rounded-2xl object-cover shadow-sm"
                  style={{ maxHeight: '550px' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Why Choose Our Employee Tracker?</h2>
            <p className="text-lg text-gray-600">
              Designed with simplicity and efficiency in mind, our platform helps you manage your team without the complexity.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 bg-primary/10 flex items-center justify-center rounded-lg mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Streamline Your Employee Management?</h2>
                <p className="text-lg text-gray-600 mb-8">
                  Join thousands of companies who trust our platform to manage their most valuable asset - their people.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/signup">
                    <Button size="lg" className="w-full sm:w-auto">
                      Get Started Now
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto">
                      Log In
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="md:w-1/2 bg-blue-600">
                <div className="h-full p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-[url('https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2090&q=80')] bg-cover bg-center">
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                    <blockquote className="text-white text-lg italic mb-4">
                      "This employee tracker has transformed how we manage our team. The interface is intuitive and it saves us hours every week."
                    </blockquote>
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full overflow-hidden mr-4 border-2 border-white">
                        <img 
                          src="https://randomuser.me/api/portraits/women/44.jpg" 
                          alt="Testimonial" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-white">
                        <p className="font-semibold">Sarah Johnson</p>
                        <p className="text-sm opacity-80">HR Director, TechCorp</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 text-primary font-semibold text-xl mb-4 md:mb-0">
              <Users className="h-6 w-6" />
              <span>EmployeeTracker</span>
            </div>
            <div className="text-gray-500 text-sm">
              © {new Date().getFullYear()} EmployeeTracker. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </Layout>
  );
};

export default Index; 