"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
	const [open, setOpen] = useState(false);
	const router = useRouter();

	const goHome = (e) => {
		e.preventDefault();
		router.push("/");
	};

	return (
		<header className="w-full bg-white border-b border-gray-200">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between h-16 items-center">
					<div className="flex items-center space-x-4">
						<a href="#" onClick={goHome} className="text-xl font-bold text-gray-800">
							AI Airline
						</a>
						<nav className="hidden md:flex items-center space-x-2">
							<Link href="/dashboard/search" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
								Search
							</Link>
							<Link href="/dashboard/my_bookings" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
								My Bookings
							</Link>
							<Link href="/dashboard/booking" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
								Book
							</Link>
						</nav>
					</div>

					<div className="flex items-center space-x-4">
						<div className="hidden md:flex items-center space-x-2">
							<Link href="/auth/login" className="px-4 py-2 text-sm font-medium text-blue-600 hover:underline">
								Login
							</Link>
							<Link href="/auth/signup" className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
								Sign up
							</Link>
						</div>

						{/* Mobile menu button */}
						<button
							onClick={() => setOpen((v) => !v)}
							aria-label="Toggle menu"
							className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100"
						>
							<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								{open ? (
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								) : (
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
								)}
							</svg>
						</button>
					</div>
				</div>
			</div>

			{/* Mobile menu panel */}
			{open && (
				<div className="md:hidden bg-white border-t border-gray-200">
					<div className="px-2 pt-2 pb-3 space-y-1">
						<Link href="/dashboard/search" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">
							Search
						</Link>
						<Link href="/dashboard/my_bookings" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">
							My Bookings
						</Link>
						<Link href="/dashboard/booking" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">
							Book
						</Link>
						<div className="border-t border-gray-100 mt-2 pt-2">
							<Link href="/auth/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">
								Login
							</Link>
							<Link href="/auth/signup" className="block px-3 py-2 rounded-md text-base font-medium text-blue-600 hover:bg-gray-50">
								Sign up
							</Link>
						</div>
					</div>
				</div>
			)}
		</header>
	);
}
