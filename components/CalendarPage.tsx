'use client';

import Calendar from './Calendar';

export default function CalendarPage() {
    return (
        <div className="h-full bg-zinc-900 p-4 flex flex-col">
            <div className="flex-1 flex items-start justify-center">
                <div className="w-full max-w-md">
                    <Calendar />
                </div>
            </div>
        </div>
    );
}