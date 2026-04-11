'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
   CreditCard,
   Download,
   Calendar,
   AlertTriangle,
   CheckCircle,
   ExternalLink,
   Plus,
   Edit,
   Trash2,
   TrendingUp,
   ShieldCheck,
   Zap,
   ArrowUpRight
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function BillingDashboardPage() {
   const [loading, setLoading] = useState(false);

   const currentPlan = {
      name: 'Professional',
      price: 99,
      billing: 'monthly',
      nextBilling: '2024-02-15',
      status: 'active'
   };

   const usage = {
      projects: { current: 18, limit: 50 },
      metrics: { current: 35, limit: 100 },
      reports: { current: 28, limit: 75 },
      responses: { current: 2847, limit: 10000 },
      teamMembers: { current: 4, limit: 10 }
   };

   const paymentMethods = [
      {
         id: '1',
         type: 'visa',
         last4: '4242',
         expiry: '12/26',
         isDefault: true
      },
      {
         id: '2',
         type: 'mastercard',
         last4: '8888',
         expiry: '09/25',
         isDefault: false
      }
   ];

   const invoices = [
      {
         id: 'INV-2024-001',
         date: '2024-01-15',
         amount: 99,
         status: 'paid',
         description: 'Professional Plan - January 2024'
      },
      {
         id: 'INV-2023-012',
         date: '2023-12-15',
         amount: 99,
         status: 'paid',
         description: 'Professional Plan - December 2023'
      },
      {
         id: 'INV-2023-011',
         date: '2023-11-15',
         amount: 99,
         status: 'paid',
         description: 'Professional Plan - November 2023'
      }
   ];

   const getUsagePercentage = (current: number, limit: number) => {
      return Math.round((current / limit) * 100);
   };

   const getUsageColor = (percentage: number) => {
      if (percentage >= 90) return 'text-rose-500';
      if (percentage >= 75) return 'text-amber-500';
      return 'text-emerald-500';
   };

   const getProgressColor = (percentage: number) => {
      if (percentage >= 90) return 'bg-rose-500';
      if (percentage >= 75) return 'bg-amber-500';
      return 'bg-emerald-500';
   };

   const handleCancelSubscription = async () => {
      if (confirm('Are you sure you want to cancel your subscription? This action cannot be undone.')) {
         setLoading(true);
         try {
            await new Promise(resolve => setTimeout(resolve, 2000));
         } catch (error) {
            console.error('Error canceling subscription:', error);
         } finally {
            setLoading(false);
         }
      }
   };

   return (
      <div className="max-w-6xl mx-auto space-y-12 pb-24 font-sans">
         {/* Header */}
         <div className="flex flex-col sm:flex-row items-center justify-between gap-8 bg-surface rounded-[2.5rem] border border-border p-8 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
               <Zap className="w-32 h-32 text-primary" />
            </div>
            <div className="relative z-10 text-center sm:text-left">
               <div className="flex items-center gap-3 mb-2 justify-center sm:justify-start">
                  <div className="w-2 h-8 bg-primary rounded-full"></div>
                  <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">Fiscal Control</h1>
               </div>
               <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-5 opacity-70">Subscription management & transmission archives</p>
            </div>
            <Link href="/billing/plans">
               <Button
                  variant="primary"
                  className="rounded-xl font-black uppercase tracking-widest text-[10px] py-4 px-10 shadow-xl shadow-primary/20"
                  icon={<ArrowUpRight className="w-4 h-4" />}
               >
                  Upgrade Plan
               </Button>
            </Link>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Current Plan Block */}
            <div className="lg:col-span-2 space-y-10">
               <div className="bg-surface rounded-3xl border border-border p-10 shadow-sm relative overflow-hidden group hover:border-primary/20 transition-all duration-500">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50"></div>
                  <div className="relative z-10">
                     <div className="flex items-center justify-between mb-10 pb-6 border-b border-border/60">
                        <div className="flex items-center gap-3">
                           <TrendingUp className="w-5 h-5 text-primary" />
                           <h2 className="text-xs font-black text-gray-900 dark:text-gray-100 uppercase tracking-[0.2em]">Active Subscriptions</h2>
                        </div>
                        <div className="flex items-center gap-2.5 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                           <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                           <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Secure Sync</span>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-4">
                           <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{currentPlan.name} Matrix</h3>
                           <div className="flex items-baseline gap-2">
                              <span className="text-6xl font-black text-gray-900 dark:text-gray-100 tracking-tighter">${currentPlan.price}</span>
                              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">/ {currentPlan.billing}</span>
                           </div>
                        </div>

                        <div className="space-y-8 flex flex-col justify-end">
                           <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                 <Calendar className="w-3.5 h-3.5 text-primary" />
                                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cycle Reset</span>
                              </div>
                              <p className="text-xl font-black text-gray-900 dark:text-gray-100">{new Date(currentPlan.nextBilling).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                           </div>
                           <div className="flex items-center gap-3">
                              <Link href="/billing/plans" className="flex-1">
                                 <Button variant="secondary" className="w-full rounded-xl font-black uppercase tracking-widest text-[9px] py-4 border-border/60">Modify Plan</Button>
                              </Link>
                              <Button variant="secondary" onClick={handleCancelSubscription} loading={loading} className="flex-1 rounded-xl font-black uppercase tracking-widest text-[9px] py-4 border-error/20 text-error hover:bg-error/5">Terminate</Button>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Usage Matrix */}
               <div className="bg-surface rounded-3xl border border-border p-10 shadow-sm space-y-12">
                  <div className="flex items-center justify-between">
                     <h2 className="text-xs font-black text-gray-900 dark:text-gray-100 uppercase tracking-[0.2em] flex items-center gap-3">
                        <Zap className="w-4 h-4 text-primary" />
                        Resource Saturation
                     </h2>
                     <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic opacity-60">Real-time Telemetry</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
                     {Object.entries(usage).map(([key, value]) => {
                        const percentage = getUsagePercentage(value.current, value.limit);
                        const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');

                        return (
                           <div key={key} className="space-y-5">
                              <div className="flex items-center justify-between">
                                 <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{label}</h3>
                                 <span className={`text-[10px] font-black px-2.5 py-1 rounded-[0.5rem] bg-surface-secondary/50 border border-border/40 ${getUsageColor(percentage)}`}>
                                    {percentage}%
                                 </span>
                              </div>

                              <div className="w-full bg-surface-secondary/40 rounded-full h-2.5 overflow-hidden border border-border/30 shadow-inner">
                                 <div
                                    className={`h-full rounded-full transition-all duration-1000 ease-out ${getProgressColor(percentage)} shadow-sm shadow-black/5 relative overflow-hidden`}
                                    style={{ width: `${percentage}%` }}
                                 >
                                    <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
                                 </div>
                              </div>

                              <div className="flex items-center justify-between text-[9px] font-black text-gray-400 uppercase tracking-widest opacity-60 mt-2">
                                 <span>{value.current.toLocaleString()} Node Loads</span>
                                 <span>{value.limit.toLocaleString()} Cap</span>
                              </div>
                           </div>
                        );
                     })}
                  </div>

                  {Object.values(usage).some(u => getUsagePercentage(u.current, u.limit) >= 90) && (
                     <div className="p-8 bg-rose-500/5 border border-rose-500/20 rounded-[2rem] relative overflow-hidden group shadow-2xl shadow-rose-500/5">
                        <div className="absolute -top-10 -right-10 opacity-10 rotate-12 group-hover:scale-110 transition-transform duration-700">
                           <AlertTriangle className="w-32 h-32 text-rose-500" />
                        </div>
                        <div className="flex items-start gap-6 relative z-10">
                           <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center flex-shrink-0 border border-rose-500/20">
                              <AlertTriangle className="w-6 h-6 text-rose-500" />
                           </div>
                           <div className="flex-1">
                              <h4 className="text-sm font-black text-rose-500 uppercase tracking-widest">Saturation Conflict Imminent</h4>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 font-bold leading-relaxed opacity-80 italic">
                                 Node capacity is nearing maximum threshold. Strategic escalation advised to prevent protocol interruptions.
                              </p>
                              <Link
                                 href="/billing/plans"
                                 className="inline-flex items-center gap-2 text-[10px] font-black text-rose-500 hover:text-rose-600 uppercase tracking-[0.15em] mt-4 group"
                              >
                                 Synthesize Advanced Plans
                                 <ExternalLink className="w-3 h-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                              </Link>
                           </div>
                        </div>
                     </div>
                  )}
               </div>
            </div>

            <div className="lg:col-span-1 space-y-10">
               {/* Payment Nodes */}
               <div className="bg-surface rounded-3xl border border-border p-8 shadow-sm group hover:border-primary/20 transition-all duration-500">
                  <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/60">
                     <h2 className="text-xs font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest">Payment Vectors</h2>
                     <button className="cursor-pointer p-2 text-primary hover:bg-primary/5 rounded-xl transition-all">
                        <Plus className="w-4 h-4" />
                     </button>
                  </div>

                  <div className="space-y-4">
                     {paymentMethods.map((method) => (
                        <div key={method.id} className="p-5 border border-border/60 rounded-2xl bg-surface-secondary/20 hover:bg-surface-secondary/40 transition-all group/card">
                           <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                 <div className="w-12 h-8 bg-surface border border-border/60 rounded-lg flex items-center justify-center shadow-sm">
                                    <CreditCard className="w-4 h-4 text-gray-400" />
                                 </div>
                                 <div>
                                    <p className="text-xs font-black text-gray-900 dark:text-gray-100 tracking-widest">
                                       •••• {method.last4}
                                    </p>
                                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mt-0.5 opacity-60">Exp {method.expiry}</p>
                                 </div>
                                 {method.isDefault && (
                                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-[8px] font-black rounded-md uppercase tracking-widest border border-primary/20">
                                       Primary
                                    </span>
                                 )}
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
                                 <button className="p-1.5 text-gray-400 hover:text-primary transition-colors">
                                    <Edit className="w-3 h-3" />
                                 </button>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               {/* Transmission History */}
               <div className="bg-surface rounded-3xl border border-border p-8 shadow-sm group hover:border-primary/20 transition-all duration-500">
                  <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/60">
                     <h2 className="text-xs font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest">Archives</h2>
                     <Link href="/billing/invoices" className="text-[9px] font-black text-primary uppercase tracking-widest hover:opacity-70">Manifest Full</Link>
                  </div>

                  <div className="space-y-4">
                     {invoices.map((invoice) => (
                        <div key={invoice.id} className="p-5 border border-border/60 rounded-2xl bg-surface-secondary/20 hover:bg-surface-secondary/40 transition-all group/inv">
                           <div className="flex justify-between items-start mb-3">
                              <div>
                                 <p className="text-[10px] font-black text-gray-900 dark:text-gray-100 tracking-widest uppercase">{invoice.id}</p>
                                 <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mt-1 opacity-60">{new Date(invoice.date).toLocaleDateString()}</p>
                              </div>
                              <div className="text-right">
                                 <p className="text-xs font-black text-gray-900 dark:text-gray-100">${invoice.amount}</p>
                                 <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[8px] font-black bg-emerald-500/10 text-emerald-500 uppercase tracking-widest border border-emerald-500/20 mt-1">
                                    {invoice.status}
                                 </span>
                              </div>
                           </div>
                           <button className="w-full mt-2 py-2.5 rounded-xl bg-surface border border-border/60 flex items-center justify-center gap-2 text-[9px] font-black text-gray-400 uppercase tracking-widest hover:text-primary hover:border-primary/40 transition-all group/btn">
                              <Download className="w-3.5 h-3.5" />
                              Download PFD
                           </button>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>

         {/* Organization Meta */}
         <div className="bg-surface rounded-3xl border border-border p-10 shadow-sm group hover:border-primary/20 transition-all duration-500">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-10 pb-6 border-b border-border/60 gap-4">
               <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  <h2 className="text-xs font-black text-gray-900 dark:text-gray-100 uppercase tracking-[0.2em]">Operational Billing Data</h2>
               </div>
               <Button variant="secondary" className="rounded-xl font-black uppercase tracking-widest text-[9px] py-4 px-8 border-border/60">Modify Logistics</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               <div className="space-y-5">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] border-s-4 border-primary pl-3">Geographic Hub</h3>
                  <div className="text-xs font-black text-gray-700 dark:text-gray-300 space-y-2 bg-surface-secondary/20 p-8 rounded-[2rem] border border-border/40 italic leading-loose">
                     <p className="text-gray-900 dark:text-gray-100 not-italic uppercase tracking-widest mb-2">Melon Impact Solutions Ltd.</p>
                     <p>123 Innovation Drive, Yaba</p>
                     <p>Lagos State, Nigeria [100001]</p>
                  </div>
               </div>

               <div className="space-y-5">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] border-s-4 border-primary pl-3">Fiscal Compliance</h3>
                  <div className="space-y-4 bg-surface-secondary/20 p-8 rounded-[2rem] border border-border/40">
                     <div className="flex justify-between items-center bg-surface p-4 rounded-xl border border-border/60">
                        <span className="text-gray-400 uppercase tracking-widest text-[9px] font-black">Entity VAT-ID</span>
                        <p className="font-black text-gray-900 dark:text-gray-100 tracking-[0.2em] text-[10px]">NG123456789</p>
                     </div>
                     <div className="flex justify-between items-center bg-surface p-4 rounded-xl border border-border/60">
                        <span className="text-gray-400 uppercase tracking-widest text-[9px] font-black">Variable Rate</span>
                        <p className="font-black text-emerald-500 tracking-widest text-[10px]">7.5% STANDARD-TX</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}