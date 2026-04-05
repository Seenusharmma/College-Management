'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  BarChart3,
  BookOpen, 
  CheckCircle2, 
  ChevronRight, 
  FileText, 
  Shield, 
  Sparkles, 
  UserCheck, 
  Users, 
  Wallet,
  ArrowRight
} from 'lucide-react';
import { useState } from 'react';

export default function DashboardPage() {
  const [pricingCycle, setPricingCycle] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <div className="w-[100vw] relative left-[50%] right-[50%] -ml-[50vw] -mr-[50vw] bg-[#0A0B10] text-zinc-50 min-h-screen overflow-x-hidden font-sans pb-24 -mt-6">
      
      {/* Hero Section */}
      <section className="relative px-4 pt-20 pb-16 text-center sm:pt-28 sm:pb-24 lg:pt-36 lg:pb-32 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#0A0B10] to-[#0A0B10]">
        <div className="mx-auto max-w-4xl space-y-8 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-sm text-indigo-300">
            <Sparkles className="h-4 w-4" />
            <span>AcademicFlow v2.0</span>
          </div>
          
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-400">
            Smart College <br />
            Management System
          </h1>
          
          <p className="mx-auto max-w-2xl text-lg text-zinc-400 sm:text-xl">
            Automate academics, attendance, and exams with a complete administrative 
            control designed for the next generation of institutions.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button size="lg" className="rounded-full bg-indigo-500 hover:bg-indigo-600 text-white px-8 h-12 w-full sm:w-auto">
              Get Started Free
            </Button>
            <Button size="lg" variant="outline" className="rounded-full border-zinc-700 bg-[#12141D] hover:bg-zinc-800 text-white px-8 h-12 w-full sm:w-auto">
              View Pricing
            </Button>
          </div>
        </div>

        {/* Dashboard Mockup Image Replacement */}
        <div className="mx-auto mt-20 max-w-5xl px-4 sm:px-6">
          <div className="relative rounded-xl bg-[#1A1F2C] p-2 sm:p-4 shadow-2xl ring-1 ring-zinc-800">
            <div className="absolute top-4 left-4 flex gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500"></div>
              <div className="h-2.5 w-2.5 rounded-full bg-yellow-500"></div>
              <div className="h-2.5 w-2.5 rounded-full bg-green-500"></div>
            </div>
            {/* The mock UI inside window */}
            <div className="mt-8 rounded-lg bg-[#F1F5F9] p-4 sm:p-8">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 space-y-6">
                  <div className="h-8 w-48 rounded bg-zinc-200"></div>
                  <div className="h-[200px] w-full rounded bg-white shadow-sm flex items-end p-4 gap-2">
                    {[40, 70, 45, 90, 65, 30, 80, 50, 75, 40].map((h, i) => (
                      <div key={i} className="flex-1 bg-indigo-200 rounded-t-sm relative group" style={{ height: `${h}%` }}>
                        <div className="absolute inset-x-0 bottom-0 bg-indigo-400 rounded-t-sm" style={{ height: `${h * 0.7}%` }}></div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="w-full lg:w-72 space-y-6">
                  <div className="h-[140px] w-full rounded bg-white shadow-sm flex items-center justify-center">
                    <div className="h-24 w-24 rounded-full border-8 border-indigo-400 border-r-indigo-100 transform -rotate-45"></div>
                  </div>
                  <div className="h-[140px] w-full rounded bg-white shadow-sm flex flex-col justify-center px-6 gap-3">
                    <div className="h-2 w-full bg-zinc-100 rounded">
                      <div className="h-2 w-3/4 bg-teal-400 rounded"></div>
                    </div>
                    <div className="h-2 w-full bg-zinc-100 rounded">
                      <div className="h-2 w-1/2 bg-blue-400 rounded"></div>
                    </div>
                    <div className="h-2 w-full bg-zinc-100 rounded">
                      <div className="h-2 w-4/5 bg-indigo-400 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl text-left">
            Precision Management
          </h2>
          <p className="mt-4 text-lg text-zinc-400">
            Every module built for institutional performance.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Card 1 - Spans 2 columns */}
          <div className="col-span-1 md:col-span-2 rounded-2xl bg-[#12141D] border border-zinc-800 p-8 flex flex-col justify-between overflow-hidden relative group">
            <div className="mb-8 relative z-10">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Academic Lifecycle Management</h3>
              <p className="text-zinc-400 max-w-md">
                Streamlined workflows to organize academic schedules and ensure value achievement with a unified 360-degree profile.
              </p>
            </div>
            {/* Abstract Graphic representing the feature */}
            <div className="relative h-48 w-full rounded-xl bg-teal-900/20 border border-teal-800/30 overflow-hidden flex items-center mb-0 mt-auto">
              <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full border border-teal-500/20"></div>
              <div className="absolute right-10 bottom-10 h-32 w-32 rounded-full border border-teal-500/30"></div>
              <div className="absolute right-[5.5rem] bottom-[5.5rem] h-8 w-8 rounded-full bg-amber-600"></div>
              <div className="h-0.5 w-full bg-teal-500/20 absolute top-1/2 left-0"></div>
              <div className="w-0.5 h-full bg-teal-500/20 absolute left-1/3 top-0"></div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="rounded-2xl bg-[#12141D] border border-zinc-800 p-8 flex flex-col group transition hover:border-indigo-500/50">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
              <UserCheck className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Attendance Tracking</h3>
            <p className="text-zinc-400 mb-6 flex-1">
              Automated roster syncing rules with RFID/Biometric attendance syncing wherever a student is needed.
            </p>
          </div>

          {/* Card 3 */}
          <div className="rounded-2xl bg-[#12141D] border border-zinc-800 p-8 flex flex-col group transition hover:border-indigo-500/50">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
              <BarChart3 className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">AI Analytics</h3>
            <p className="text-zinc-400 mb-6 flex-1">
              Real-time institutional health checks from individual student performance metrics to organizational adjustment.
            </p>
          </div>

          {/* Card 4 */}
          <div className="rounded-2xl bg-[#12141D] border border-zinc-800 p-8 flex flex-col group transition hover:border-indigo-500/50">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
              <Wallet className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Fee Management</h3>
            <p className="text-zinc-400 mb-6 flex-1">
              Automated reminders, fee disbursements, and accounting matching with secure payment integrations.
            </p>
          </div>

          {/* Card 5 */}
          <div className="rounded-2xl bg-[#12141D] border border-zinc-800 p-8 flex flex-col group transition hover:border-indigo-500/50">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Exam & Result System</h3>
            <p className="text-zinc-400 mb-6 flex-1">
              Seamless scheduling of both subjective and automated digital certificate generation for all students.
            </p>
          </div>
        </div>
      </section>

      {/* Implementation Journey Section */}
      <section className="mx-auto max-w-5xl px-4 py-24 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-white mb-4">Implementation Journey</h2>
          <div className="h-1 w-12 bg-indigo-500 mx-auto rounded"></div>
        </div>

        <div className="grid gap-8 md:grid-cols-3 relative">
          <div className="hidden md:block absolute top-6 left-[15%] right-[15%] h-[1px] bg-zinc-800 z-0"></div>
          
          <div className="flex flex-col items-center text-center relative z-10">
            <div className="h-12 w-12 rounded-full border border-zinc-700 bg-[#0A0B10] flex items-center justify-center text-zinc-300 font-bold mb-6">
              01
            </div>
            <h3 className="text-lg font-bold text-white mb-3">Data Sync</h3>
            <p className="text-sm text-zinc-400 px-4">
              Connect with existing institutional data to allow intelligent organization.
            </p>
          </div>

          <div className="flex flex-col items-center text-center relative z-10">
            <div className="h-12 w-12 rounded-full border border-zinc-700 bg-[#0A0B10] flex items-center justify-center text-zinc-300 font-bold mb-6">
              02
            </div>
            <h3 className="text-lg font-bold text-white mb-3">Module Setup</h3>
            <p className="text-sm text-zinc-400 px-4">
              Configure permissions, academic structures, and grading scales for your campus.
            </p>
          </div>

          <div className="flex flex-col items-center text-center relative z-10">
            <div className="h-12 w-12 rounded-full border border-zinc-700 bg-[#0A0B10] flex items-center justify-center text-zinc-300 font-bold mb-6">
              03
            </div>
            <h3 className="text-lg font-bold text-white mb-3">Go Live!</h3>
            <p className="text-sm text-zinc-400 px-4">
              Launch your institution into a completely fully-automated digital environment.
            </p>
          </div>
        </div>
      </section>

      {/* Stats / Architected Section */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 border-t border-zinc-800/50">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-12">
              Architected for Modern Institutions
            </h2>
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="mt-1 h-8 w-8 shrink-0 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                  <Shield className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Unmatched Performance</h3>
                  <p className="text-zinc-400">Delivers a globally distributed edge network for &lt;50ms response times globally over any device.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="mt-1 h-8 w-8 shrink-0 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                  <Shield className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Military-Grade Security</h3>
                  <p className="text-zinc-400">End-to-end encryption of all student records and financial transactions with HIPAA compliance standards.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="mt-1 h-8 w-8 shrink-0 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                  <ChevronRight className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">API-First Architecture</h3>
                  <p className="text-zinc-400">Open your college to multi-app connection, an infrastructure you grow extensively with your codebase.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-[#12141D] border border-zinc-800 p-8 flex flex-col justify-center text-center aspect-square">
              <div className="text-4xl font-extrabold text-white mb-2">99.9%</div>
              <div className="text-sm font-medium text-zinc-500 uppercase tracking-widest">Uptime</div>
            </div>
            <div className="rounded-2xl bg-[#12141D] border border-zinc-800 p-8 flex flex-col justify-center text-center aspect-square md:transform md:-translate-y-8">
              <div className="text-4xl font-extrabold text-white mb-2">45%</div>
              <div className="text-sm font-medium text-zinc-500 uppercase tracking-widest">Speed uplift</div>
            </div>
            <div className="rounded-2xl bg-[#12141D] border border-zinc-800 p-8 flex flex-col justify-center text-center aspect-square">
              <div className="text-4xl font-extrabold text-white mb-2">50++</div>
              <div className="text-sm font-medium text-zinc-500 uppercase tracking-widest">Integrations</div>
            </div>
            <div className="rounded-2xl bg-[#12141D] border border-zinc-800 p-8 flex flex-col justify-center text-center aspect-square md:transform md:-translate-y-8">
              <div className="text-4xl font-extrabold text-white mb-2">255+</div>
              <div className="text-sm font-medium text-zinc-500 uppercase tracking-widest">Campuses</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-white mb-6">
            Transparent Institutional Pricing
          </h2>
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm font-medium ${pricingCycle === 'monthly' ? 'text-white' : 'text-zinc-400'}`}>Monthly</span>
            <button 
              onClick={() => setPricingCycle(p => p === 'monthly' ? 'yearly' : 'monthly')}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-indigo-500"
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${pricingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
            <span className={`text-sm font-medium ${pricingCycle === 'yearly' ? 'text-white' : 'text-zinc-400'}`}>Yearly (Save 20%)</span>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-3 items-center">
          {/* Basic */}
          <div className="rounded-2xl bg-[#12141D] border border-zinc-800 p-8">
            <h3 className="text-xl font-bold text-white mb-2">Basic</h3>
            <p className="text-sm text-zinc-400 mb-6">For smaller institutes testing systems.</p>
            <div className="mb-6">
              <span className="text-4xl font-extrabold text-white">${pricingCycle === 'monthly' ? '299' : '239'}</span>
              <span className="text-zinc-400">/mo</span>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex gap-3 text-zinc-300 text-sm"><CheckCircle2 className="h-5 w-5 text-indigo-400 shrink-0" /> Up to 1000 Students</li>
              <li className="flex gap-3 text-zinc-300 text-sm"><CheckCircle2 className="h-5 w-5 text-indigo-400 shrink-0" /> Core Administrative Modules</li>
              <li className="flex gap-3 text-zinc-300 text-sm"><CheckCircle2 className="h-5 w-5 text-indigo-400 shrink-0" /> API Access</li>
            </ul>
            <Button variant="outline" className="w-full rounded-full border-zinc-700 bg-transparent text-white hover:bg-zinc-800">
              Contact Sales
            </Button>
          </div>

          {/* Pro */}
          <div className="rounded-3xl bg-[#1A1F2E] border-2 border-indigo-500 p-8 relative shadow-2xl shadow-indigo-900/20 transform md:-translate-y-4">
            <div className="absolute top-0 right-8 transform -translate-y-1/2">
              <span className="bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Popular</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Pro</h3>
            <p className="text-sm text-zinc-400 mb-6">Best for growing regional colleges.</p>
            <div className="mb-6">
              <span className="text-4xl font-extrabold text-white">${pricingCycle === 'monthly' ? '899' : '719'}</span>
              <span className="text-zinc-400">/mo</span>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex gap-3 text-zinc-300 text-sm"><CheckCircle2 className="h-5 w-5 text-indigo-400 shrink-0" /> Unlimited Students</li>
              <li className="flex gap-3 text-zinc-300 text-sm"><CheckCircle2 className="h-5 w-5 text-indigo-400 shrink-0" /> Advanced Custom Domain</li>
              <li className="flex gap-3 text-zinc-300 text-sm"><CheckCircle2 className="h-5 w-5 text-indigo-400 shrink-0" /> Full Module Management</li>
              <li className="flex gap-3 text-zinc-300 text-sm"><CheckCircle2 className="h-5 w-5 text-indigo-400 shrink-0" /> AI Analytics Dashboard</li>
            </ul>
            <Button className="w-full rounded-full bg-indigo-500 text-white hover:bg-indigo-600">
              Start Pro Trial
            </Button>
          </div>

          {/* Enterprise */}
          <div className="rounded-2xl bg-[#12141D] border border-zinc-800 p-8">
            <h3 className="text-xl font-bold text-white mb-2">Enterprise</h3>
            <p className="text-sm text-zinc-400 mb-6">Multi-campus university chains.</p>
            <div className="mb-6">
              <span className="text-4xl font-extrabold text-white">Custom</span>
            </div>
            <ul className="space-y-4 mb-14">
              <li className="flex gap-3 text-zinc-300 text-sm"><CheckCircle2 className="h-5 w-5 text-indigo-400 shrink-0" /> White-labeled App</li>
              <li className="flex gap-3 text-zinc-300 text-sm"><CheckCircle2 className="h-5 w-5 text-indigo-400 shrink-0" /> ERP/HRMS Connect</li>
              <li className="flex gap-3 text-zinc-300 text-sm"><CheckCircle2 className="h-5 w-5 text-indigo-400 shrink-0" /> 24/7 Dedicated Rep</li>
            </ul>
            <Button variant="outline" className="w-full rounded-full border-zinc-700 bg-transparent text-white hover:bg-zinc-800">
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-[#161925] border border-zinc-800 p-12 sm:p-16 text-center shadow-xl">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-6">
            Start managing your college smarter today
          </h2>
          <p className="text-lg text-zinc-400 mb-10 max-w-2xl mx-auto">
            Join hundreds of institutions already evolving their administrative processes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="rounded-full bg-indigo-500 hover:bg-indigo-600 text-white px-8 h-12 w-full sm:w-auto">
              Get Started Free
            </Button>
            <Button size="lg" variant="outline" className="rounded-full border-zinc-700 bg-[#12141D] hover:bg-zinc-800 text-white px-8 h-12 w-full sm:w-auto">
              Talk to our Experts
            </Button>
          </div>
        </div>
      </section>

      {/* Footer Details Wrapper */}
      <footer className="mx-auto max-w-7xl px-4 pt-16 pb-8 sm:px-6 lg:px-8 border-t border-zinc-800/50 mt-12 text-sm text-zinc-500">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4 text-white font-bold">
              <div className="h-6 w-6 rounded bg-indigo-500 flex items-center justify-center text-xs">A</div>
              AcademicFlow
            </div>
            <p className="mb-4">Empower educators, administrators, and students. The complete dashboard and unified college management for performance.</p>
            <div className="flex gap-4">
              <div className="h-8 w-8 rounded-full bg-zinc-800"></div>
              <div className="h-8 w-8 rounded-full bg-zinc-800"></div>
              <div className="h-8 w-8 rounded-full bg-zinc-800"></div>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-3">
              <li><Link href="#" className="hover:text-white transition">Features</Link></li>
              <li><Link href="#" className="hover:text-white transition">Pricing</Link></li>
              <li><Link href="#" className="hover:text-white transition">Security</Link></li>
              <li><Link href="#" className="hover:text-white transition">Integrations</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-3">
              <li><Link href="#" className="hover:text-white transition">Documentation</Link></li>
              <li><Link href="#" className="hover:text-white transition">Help Center</Link></li>
              <li><Link href="#" className="hover:text-white transition">Community</Link></li>
              <li><Link href="#" className="hover:text-white transition">Privacy Policy</Link></li>
            </ul>
          </div>
          
          <div className="col-span-2 md:col-span-1">
            <h4 className="text-white font-semibold mb-4">Stay Updates</h4>
            <p className="mb-4">Join our community and receive product updates.</p>
            <div className="flex bg-[#12141D] rounded-full p-1 border border-zinc-800">
              <input type="email" placeholder="Email address" className="bg-transparent border-none outline-none px-4 py-2 text-white text-sm w-full" />
              <button className="bg-white text-black rounded-full h-8 w-8 flex items-center justify-center hover:bg-zinc-200 transition">
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        <div className="text-center pt-8 border-t border-zinc-800/50 flex flex-col items-center">
          <p>© 2024 AcademicFlow Inc. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
