"use client"
import React, { useEffect, useState } from 'react';
import { Button, Card, CardBody, CardHeader, Link } from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import { siteConfig } from '@/config/site';
//console.log
// Define the Contest interface
interface Contest {
  _id: string;
  contestName: string;
  contestUrl: string;
  startTime: string;
  endTime: string;
  phase: 'BEFORE' | 'RUNNING' | 'FINISHED';
  countdown: string;
}

interface Time {
  date: string;
  time: string;
}

interface User {
  handle: string;
  avatarUrl: string;
  groupRating: number;
  type: string;
}

const ContestComponent: React.FC = () => {
  const [contests, setContests] = useState<Contest[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null); // user can be either a User object or null
  const [countdowns, setCountdowns] = useState<Record<string, string>>({});
  const router = useRouter(); // Store countdowns by contest ID
  useEffect(() => {
    const intervalId = setInterval(() => {
      setContests((prevContests) => {
        let shouldRefresh = false;
  
        const updatedContests = prevContests.map((contest) => {
          const countdown = getCountdown(contest.startTime, contest.endTime, contest.phase);
  
          // If the countdown reaches "00:00:00", set flag for refresh
          if (countdown === "00:00:00" && (contest.phase === 'BEFORE' || contest.phase === 'RUNNING')) {
            shouldRefresh = true;
          }
  
          return { ...contest, countdown };
        });
  
        // Trigger refresh if a countdown hit "00:00:00"
        if (shouldRefresh) {
          router.push("/contests");
        }
  
        return updatedContests;
      });
    }, 1000);
  
    return () => clearInterval(intervalId); // Clear the interval on component unmount
  }, [contests]);
  useEffect(() => {
    const fetchUser = async () => {
      const sessionID = localStorage.getItem("sessionID");

      if (!sessionID) {
        console.log("No sessionID found in localStorage.");
        return;
      }

      try {
        const response = await fetch(`${siteConfig.links.api}/user?sessionID=${sessionID}`);
        if (response.ok) {
          const userData = await response.json();
          setUser(userData); // This updates the user state
        } else {
          console.error("Failed to fetch user data.");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    // Fetch contests from API
    const fetchContests = async () => {
      try {
        const response = await fetch(`${siteConfig.links.api}/contest/all`);
        if (!response.ok) throw new Error('Failed to fetch contests');
        const data = await response.json();
        setContests(data.contests);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchContests();
  }, []);

  useEffect(() => {
    // Update the countdown every second
    const intervalId = setInterval(() => {
      setContests((prevContests) => {
        const updatedContests = prevContests.map((contest) => {
          const countdown = getCountdown(contest.startTime, contest.endTime, contest.phase);
          return { ...contest, countdown };
        });
        return updatedContests;
      });
    }, 1000);

    // Clear the interval when the component is unmounted
    return () => clearInterval(intervalId);
  }, [contests]); // Re-run every time contests change

  const getCountdown = (startTime: string, endTime: string, phase: string): string => {
    if (phase === 'FINISHED') return '00:00:00';
  
    const now = new Date();
    const targetTime = phase === 'BEFORE' ? new Date(startTime) : new Date(endTime);
  
    const timeDiff = targetTime.getTime() - now.getTime();
  
    if (timeDiff <= 0) return '00:00:00';
  
    const hours = String(Math.floor(timeDiff / (1000 * 60 * 60))).padStart(2, '0');
    const minutes = String(Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
    const seconds = String(Math.floor((timeDiff % (1000 * 60)) / 1000)).padStart(2, '0');
  
    return `${hours}:${minutes}:${seconds}`;
  };
  

  const formatDate = (dateStr: string): Time => {
    const date = new Date(dateStr);
  
    // Apply GMT+6 offset
    const offsetHours = 6;
  
    // Get the UTC values
    const utcDay = date.getUTCDate();
    const utcMonth = date.getUTCMonth();
    const utcYear = date.getUTCFullYear();
    let utcHours = date.getUTCHours() + offsetHours; // Adjust hours by the offset
    let utcMinutes = date.getUTCMinutes();
  
    // Handle hour overflow (i.e., going from 23 to 24)
    if (utcHours >= 24) {
      utcHours -= 24;
    }
  
    // Ensure two digits for time format
    const day = String(utcDay).padStart(2, '0');
    const month = String(utcMonth + 1).padStart(2, '0');
    const year = utcYear;
    const hours = String(utcHours).padStart(2, '0');
    const minutes = String(utcMinutes).padStart(2, '0');
  
    return {
      date: `${day}/${month}/${year}`,
      time: `${hours}:${minutes}`,
    };
  };
  

  return (
    <div className="space-y-4">
      {error && <div className="text-red-500">{error}</div>}
      {contests.length === 0 && <div>No contests found.</div>}
      {(user && (user.type === "MANAGER" || user.type === "ADMIN")) &&
        <Link href="/contests/add">Add a contest</Link>
      }

      {contests.map((contest) => {
        const { _id, contestName, contestUrl, startTime, endTime, phase, countdown } = contest;
        const formattedStart = formatDate(startTime);
        const formattedEnd = formatDate(endTime);
        const duration = new Date(endTime).getTime() - new Date(startTime).getTime();
        const formattedDuration = `${Math.floor(duration / (1000 * 60 * 60))}h ${Math.floor(
          (duration % (1000 * 60 * 60)) / (1000 * 60)
        )}m`;

        return (
          <Card key={_id} className="mb-4 p-4 shadow-lg rounded-lg">
            <CardHeader>
              <h3 className="text-xl font-semibold">{contestName}</h3>
            </CardHeader>
            <CardBody>
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <p className="text-sm">
                    <strong>Start Time:</strong> {formattedStart.date} <sup>{formattedStart.time}</sup>
                  </p>
                </div>
                <div className="flex-1">
                  <p className="text-sm">
                    <strong>End Time:</strong> {formattedEnd.date} <sup>{formattedEnd.time}</sup>
                  </p>
                </div>
                <div className="flex-1">
                  <p className="text-sm">
                    <strong>Duration:</strong> {formattedDuration}
                  </p>
                </div>
                <div className="flex-1">
                  <p className="text-sm">
                    <strong>Phase:</strong> {phase}  <strong>({countdown})</strong>
                  </p>
                </div>
                <div className="flex justify-end">
                  <Button as="a" href={contestUrl} target="_blank" color="primary">
                    Contest Link
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
};

export default ContestComponent;
