import { redirect } from 'next/navigation';

export default function SignupPage() {
  redirect('/login');
}

/*
// OLD SIGNUP PAGE CONTENT (REPLACED BY REDIRECT)
/* eslint-disable @typescript-eslint/no-explicit-any */
// "use client";

// import React, { useState } from 'react';
// import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
// import { useRouter } from 'next/navigation';
// import { useAuth } from '@/hooks/useAuth';
// import Link from 'next/link';

// export function SignupPageOld() {
//   const router = useRouter();
//   const { signup } = useAuth();
//   const [formData, setFormData] = useState({
//     firstName: '',
//     lastName: '',
//     email: '',
//     password: '',
//     organizationName: ''
//   });
//   const [showPassword, setShowPassword] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//     if (error) setError('');
//   };

//   const handleSignup = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError('');
//     setSuccess('');

//     try {
//       const response = await signup(formData);
//       setSuccess(response.message);

//       setTimeout(() => {
//         router.push('/login?message=check-email');
//       }, 2000);

//     } catch (err: any) {
//       console.error('Signup error:', err);

//       if (err.message?.includes('USER_LIMIT_REACHED')) {
//         setError('Your organization has reached its user limit. The organization owner has been notified to upgrade the plan.');
//       } else if (err.message?.includes('TRIAL_LIMIT_REACHED')) {
//         setError('Trial period allows maximum 2 users. Please ask your organization owner to upgrade.');
//       } else {
//         setError(err.message || 'Signup failed. Please try again.');
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <div className="text-center">
//         <h1 className="text-2xl font-semibold text-gray-900 mb-2">
//           Create Your Account
//         </h1>
//         <p className="text-sm text-gray-600">
//           Start measuring impact in minutes
//         </p>
//       </div>

//       <form onSubmit={handleSignup} className="space-y-4">
//         {error && (
//           <div className="bg-red-50 border border-red-200 rounded-lg p-3">
//             <p className="text-red-600 text-sm">{error}</p>
//           </div>
//         )}

//         {success && (
//           <div className="bg-green-50 border border-green-200 rounded-lg p-3">
//             <p className="text-green-600 text-sm">{success}</p>
//           </div>
//         )}

//         <div className="grid grid-cols-2 gap-3">
//           <div>
//             <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1.5">
//               First Name
//             </label>
//             <div className="relative">
//               <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//               <input
//                 type="text"
//                 id="firstName"
//                 name="firstName"
//                 value={formData.firstName}
//                 onChange={handleInputChange}
//                 placeholder="John"
//                 className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
//                 required
//               />
//             </div>
//           </div>

//           <div>
//             <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1.5">
//               Last Name
//             </label>
//             <div className="relative">
//               <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//               <input
//                 type="text"
//                 id="lastName"
//                 name="lastName"
//                 value={formData.lastName}
//                 onChange={handleInputChange}
//                 placeholder="Doe"
//                 className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
//                 required
//               />
//             </div>
//           </div>
//         </div>

//         <div>
//           <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
//             Work Email
//           </label>
//           <div className="relative">
//             <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//             <input
//               type="email"
//               id="email"
//               name="email"
//               value={formData.email}
//               onChange={handleInputChange}
//               placeholder="john@company.com"
//               className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
//               required
//             />
//           </div>
//         </div>

//         <div>
//           <label htmlFor="organizationName" className="block text-sm font-medium text-gray-700 mb-1.5">
//             Organization Name <span className="text-gray-400 font-normal">(Optional)</span>
//           </label>
//           <input
//             type="text"
//             id="organizationName"
//             name="organizationName"
//             value={formData.organizationName}
//             onChange={handleInputChange}
//             placeholder="Auto-detected from email"
//             className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
//           />
//         </div>

//         <div>
//           <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
//             Password
//           </label>
//           <div className="relative">
//             <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//             <input
//               type={showPassword ? 'text' : 'password'}
//               id="password"
//               name="password"
//               value={formData.password}
//               onChange={handleInputChange}
//               placeholder="Min. 8 characters"
//               className="w-full pl-9 pr-10 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
//               required
//               minLength={8}
//             />
//             <button
//               type="button"
//               onClick={() => setShowPassword(!showPassword)}
//               className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
//             >
//               {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//             </button>
//           </div>
//         </div>

//         <button
//           type="submit"
//           disabled={isLoading}
//           className="w-full bg-primary hover:bg-primary-hover text-white py-2.5 px-4 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//         >
//           {isLoading ? (
//             <div className="flex items-center justify-center">
//               <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
//               Creating Account...
//             </div>
//           ) : (
//             'Create Account'
//           )}
//         </button>

//         <p className="text-xs text-gray-500 text-center">
//           By creating an account, you agree to our{' '}
//           <Link href="https://www.melon.ng/terms-of-use" className="text-primary hover:underline">Terms</Link> and{' '}
//           <Link href="https://www.melon.ng/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>
//         </p>
//       </form>

//       <div className="text-center pt-2">
//         <p className="text-sm text-gray-600">
//           Already have an account?{' '}
//           <button
//             onClick={() => router.push('/login')}
//             className="text-primary hover:underline font-medium"
//           >
//             Sign in
//           </button>
//         </p>
//       </div>
//     </div>
//   );
// }
