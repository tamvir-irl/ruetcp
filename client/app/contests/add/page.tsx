"use client"

import React, { useState } from 'react';
import { Card, CardHeader, CardBody, Button, Spacer, Input } from '@nextui-org/react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { useRouter } from 'next/navigation';
import { siteConfig } from '@/config/site';

dayjs.extend(utc);
dayjs.extend(timezone);

const AddContestPage = () => {
  const [contestTitle, setContestTitle] = useState('');
  const [contestLink, setContestLink] = useState('');
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [startTime, setStartTime] = useState<Dayjs | null>(null);
  const [duration, setDuration] = useState('');
  const router = useRouter();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Combine start date and start time
    const startDateTime = dayjs(startDate)
      .hour(dayjs(startTime).hour())
      .minute(dayjs(startTime).minute());

    // Convert to GMT+6
    const startTimeGMT6 = startDateTime;

    // Calculate end time
    const endTimeGMT6 = startTimeGMT6.add(parseInt(duration, 10), 'minute');

    // Prepare request body
    const requestBody = {
      contestName: contestTitle,
      contestUrl: contestLink,
      startTime: startTimeGMT6.toISOString(),
      endTime: endTimeGMT6.toISOString(),
    };

    try {
      const response = await fetch(`${siteConfig.links.api}/contest/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        alert('Contest added successfully!');
        // Clear the form
        setContestTitle('');
        setContestLink('');
        setStartDate(null);
        setStartTime(null);
        setDuration('');
        router.push('/contests');
      } else {
        const errorData = await response.json();
        alert(`Failed to add contest: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error adding contest:', error);
      alert('An error occurred while adding the contest.');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <Card>
        <CardHeader>
          <h1>Add New Contest</h1>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit}>
            <Input
              label="Contest Title"
              value={contestTitle}
              onChange={(e) => setContestTitle(e.target.value)}
              placeholder="Enter the contest title"
              required
            />
            <Spacer y={1} />
            <Input
              label="Contest Link"
              type="url"
              value={contestLink}
              onChange={(e) => setContestLink(e.target.value)}
              placeholder="Enter the contest link"
              required
            />
            <Spacer y={1} />
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                slotProps={{ textField: { required: true } }}
              />
              <Spacer y={1} />
              <TimePicker
                label="Start Time"
                value={startTime}
                onChange={(newValue) => setStartTime(newValue)}
                slotProps={{ textField: { required: true } }}
              />
            </LocalizationProvider>
            <Spacer y={1} />
            <Input
              label="Duration (in minutes)"
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="Enter the duration in minutes"
              required
            />
            <Spacer y={1} />
            <Button color="primary" type="submit">
              Add Contest
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default AddContestPage;
