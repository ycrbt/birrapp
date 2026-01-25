'use client';

import Calendar from './Calendar';

export default function CalendarPage() {
    return (
        <div className="h-full bg-zinc-900 p-4 flex flex-col">
            <div className="flex-1 flex justify-center min-h-0">
                <div className="w-full max-w-md flex flex-col min-h-0">
                    <Calendar />
                </div>
            </div>
        </div>
    );
}