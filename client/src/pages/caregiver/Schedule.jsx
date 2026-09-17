import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Clock,
  CalendarDays,
  Pencil,
  Trash2,
  X,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ClipboardList,
} from 'lucide-react';

import axios from '../../services/axios';
import { useAuth } from '../../context/AuthContext';

function Schedule() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    time: '',
    activity: '',
    notes: '',
  });

  // =========================================================
  // LOAD PATIENT SCHEDULE
  // =========================================================

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await axios.get('/caregiver/schedules');

      setSchedule(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (err) {
      console.error('Failed to load schedule:', err);

      setError(
        err.response?.data?.message ||
          'Unable to load the daily schedule.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  // =========================================================
  // FORM HANDLING
  // =========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      time: '',
      activity: '',
      notes: '',
    });

    setEditingId(null);
    setShowForm(false);
    setError('');
  };

  // =========================================================
  // ADD / UPDATE
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');
    setSuccess('');

    if (!formData.time || !formData.activity.trim()) {
      setError('Please enter both time and activity.');
      return;
    }

    try {
      setSaving(true);

      if (editingId) {
        const response = await axios.put(
          `/caregiver/schedules/${editingId}`,
          {
            time: formData.time,
            activity: formData.activity.trim(),
            notes: formData.notes.trim(),
          }
        );

        setSchedule((previous) =>
          previous.map((item) =>
            item._id === editingId ? response.data : item
          )
        );

        setSuccess('Schedule updated successfully.');
      } else {
        const response = await axios.post(
          '/caregiver/schedules',
          {
            time: formData.time,
            activity: formData.activity.trim(),
            notes: formData.notes.trim(),
          }
        );

        setSchedule((previous) => [
          ...previous,
          response.data,
        ]);

        setSuccess('Schedule added successfully.');
      }

      resetForm();

      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      console.error('Schedule save error:', err);

      setError(
        err.response?.data?.message ||
          'Unable to save the schedule.'
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // EDIT
  // =========================================================

  const handleEdit = (item) => {
    setEditingId(item._id);

    setFormData({
      time: item.time || '',
      activity: item.activity || '',
      notes: item.notes || '',
    });

    setShowForm(true);
    setError('');
    setSuccess('');

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this schedule item?'
    );

    if (!confirmed) {
      return;
    }

    try {
      setError('');
      setSuccess('');

      await axios.delete(`/caregiver/schedules/${id}`);

      setSchedule((previous) =>
        previous.filter((item) => item._id !== id)
      );

      setSuccess('Schedule deleted successfully.');

      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      console.error('Schedule delete error:', err);

      setError(
        err.response?.data?.message ||
          'Unable to delete the schedule.'
      );
    }
  };

  // =========================================================
  // FORMAT TIME
  // =========================================================

  const formatTime = (time) => {
    if (!time) {
      return '';
    }

    const [hours, minutes] = time.split(':');

    if (hours === undefined || minutes === undefined) {
      return time;
    }

    const hourNumber = Number(hours);

    if (Number.isNaN(hourNumber)) {
      return time;
    }

    const period = hourNumber >= 12 ? 'PM' : 'AM';

    const displayHour =
      hourNumber % 12 === 0 ? 12 : hourNumber % 12;

    return `${displayHour}:${minutes} ${period}`;
  };

  // =========================================================
  // SORT SCHEDULE
  // =========================================================

  const sortedSchedule = [...schedule].sort((a, b) =>
    String(a.time || '').localeCompare(String(b.time || ''))
  );

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* =====================================================
          TOP HEADER
      ===================================================== */}

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">

          <div className="flex items-center gap-4">

            <button
              type="button"
              onClick={() => navigate('/caregiver/dashboard')}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-blue-600"
              title="Back to dashboard"
            >
              <ArrowLeft size={19} />
            </button>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                CAREMATE
              </p>

              <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
                Daily Schedule
              </h1>
            </div>

          </div>

          <div className="hidden items-center gap-3 sm:flex">

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <CalendarDays size={19} />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-800">
                Caregiver
              </p>

              <p className="text-xs text-slate-500">
                {user?.name || 'Caregiver'}
              </p>
            </div>

          </div>

        </div>
      </header>


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8">

        {/* PAGE INTRO */}

        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">

          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
              <ClipboardList size={14} />
              Patient Care Plan
            </div>

            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
              Manage Today's Routine
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Add activities, medication reminders, meals,
              exercises, appointments, and other important
              activities for your linked patient.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setFormData({
                time: '',
                activity: '',
                notes: '',
              });
              setError('');
              setSuccess('');
              setShowForm(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus size={18} />
            Add Schedule
          </button>

        </div>


        {/* =====================================================
            SUCCESS MESSAGE
        ===================================================== */}

        {success && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            <CheckCircle2 size={19} />
            <span>{success}</span>
          </div>
        )}


        {/* =====================================================
            ERROR MESSAGE
        ===================================================== */}

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            <AlertCircle size={19} />
            <span>{error}</span>
          </div>
        )}


        {/* =====================================================
            ADD / EDIT FORM
        ===================================================== */}

        {showForm && (
          <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

            <div className="mb-6 flex items-start justify-between">

              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {editingId
                    ? 'Edit Schedule'
                    : 'Add New Schedule'}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Enter the activity details for your patient.
                </p>
              </div>

              <button
                type="button"
                onClick={resetForm}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                title="Close"
              >
                <X size={20} />
              </button>

            </div>


            <form onSubmit={handleSubmit}>

              <div className="grid gap-5 md:grid-cols-2">

                {/* TIME */}

                <div>
                  <label
                    htmlFor="schedule-time"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Time
                  </label>

                  <div className="relative">

                    <Clock
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="schedule-time"
                      type="time"
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                      required
                    />

                  </div>
                </div>


                {/* ACTIVITY */}

                <div>
                  <label
                    htmlFor="schedule-activity"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Activity
                  </label>

                  <input
                    id="schedule-activity"
                    type="text"
                    name="activity"
                    value={formData.activity}
                    onChange={handleChange}
                    placeholder="e.g. Breakfast, Medicine, Walk"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                    required
                  />
                </div>

              </div>


              {/* NOTES */}

              <div className="mt-5">

                <label
                  htmlFor="schedule-notes"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Notes
                  <span className="ml-2 font-normal text-slate-400">
                    (Optional)
                  </span>
                </label>

                <textarea
                  id="schedule-notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Add any instructions or additional information..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />

              </div>


              {/* FORM BUTTONS */}

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {saving ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={17} />
                      {editingId
                        ? 'Update Schedule'
                        : 'Save Schedule'}
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>
        )}


        {/* =====================================================
            SCHEDULE CARD
        ===================================================== */}

        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">

          {/* CARD HEADER */}

          <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">

            <div>
              <h3 className="font-bold text-slate-900">
                Patient's Daily Routine
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Changes made here are saved for the linked patient.
              </p>
            </div>

            <div className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
              {schedule.length}{' '}
              {schedule.length === 1
                ? 'Activity'
                : 'Activities'}
            </div>

          </div>


          {/* LOADING */}

          {loading && (
            <div className="flex flex-col items-center justify-center px-6 py-16">

              <Loader2
                size={30}
                className="animate-spin text-blue-600"
              />

              <p className="mt-4 text-sm text-slate-500">
                Loading patient's schedule...
              </p>

            </div>
          )}


          {/* EMPTY STATE */}

          {!loading && sortedSchedule.length === 0 && (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <CalendarDays size={28} />
              </div>

              <h3 className="mt-5 text-lg font-bold text-slate-900">
                No schedule added yet
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                Create the patient's daily routine by adding
                activities such as meals, medication, exercise,
                rest, or appointments.
              </p>

              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
              >
                <Plus size={17} />
                Add First Activity
              </button>

            </div>
          )}


          {/* SCHEDULE LIST */}

          {!loading && sortedSchedule.length > 0 && (
            <div className="divide-y divide-slate-100">

              {sortedSchedule.map((item, index) => (
                <div
                  key={item._id}
                  className="group px-6 py-5 transition hover:bg-slate-50 sm:px-8"
                >

                  <div className="flex gap-4">

                    {/* TIME */}

                    <div className="flex w-20 shrink-0 flex-col items-center sm:w-24">

                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                        <Clock size={20} />
                      </div>

                      <span className="mt-2 text-xs font-bold text-slate-700">
                        {formatTime(item.time)}
                      </span>

                    </div>


                    {/* CONTENT */}

                    <div className="min-w-0 flex-1">

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                        <div>

                          <h4 className="text-base font-bold text-slate-900">
                            {item.activity}
                          </h4>

                          {item.notes && (
                            <p className="mt-1.5 text-sm leading-6 text-slate-500">
                              {item.notes}
                            </p>
                          )}

                        </div>


                        {/* ACTIONS */}

                        <div className="flex shrink-0 gap-2">

                          <button
                            type="button"
                            onClick={() => handleEdit(item)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                            title="Edit schedule"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(item._id)
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                            title="Delete schedule"
                          >
                            <Trash2 size={16} />
                          </button>

                        </div>

                      </div>

                      <div className="mt-3 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
                        Activity {index + 1}
                      </div>

                    </div>

                  </div>

                </div>
              ))}

            </div>
          )}

        </div>


        {/* =====================================================
            INFORMATION CARD
        ===================================================== */}

        <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4">

          <div className="flex gap-3">

            <CalendarDays
              size={19}
              className="mt-0.5 shrink-0 text-blue-600"
            />

            <div>

              <p className="text-sm font-bold text-blue-800">
                How this works
              </p>

              <p className="mt-1 text-xs leading-5 text-blue-700/80">
                You are managing the schedule of the patient
                linked to your caregiver account. Saved activities
                will also be available on the patient's dashboard.
              </p>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}

export default Schedule;