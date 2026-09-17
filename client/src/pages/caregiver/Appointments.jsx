import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  MapPin,
  Plus,
  Pencil,
  Trash2,
  X,
  Stethoscope,
  CheckCircle2,
  AlertCircle,
  CalendarCheck,
} from 'lucide-react';

import axios from '../../services/axios';
import { useAuth } from '../../context/AuthContext';

const emptyForm = {
  date: '',
  time: '',
  title: '',
  description: '',
  location: '',
  status: 'Scheduled',
};

const formatDate = (dateString) => {
  if (!dateString) return '';

  const date = new Date(`${dateString}T00:00:00`);

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const getStatusClasses = (status) => {
  if (status === 'Completed') {
    return 'bg-emerald-50 text-emerald-700 border-emerald-100';
  }

  if (status === 'Cancelled') {
    return 'bg-red-50 text-red-700 border-red-100';
  }

  return 'bg-blue-50 text-blue-700 border-blue-100';
};

const Appointments = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // --------------------------------------------------
  // FETCH APPOINTMENTS
  // --------------------------------------------------

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await axios.get('/caregiver/appointments');

      setAppointments(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (err) {
      console.error('Fetch appointments error:', err);

      setError(
        err.response?.data?.message ||
          'Unable to load appointments. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // --------------------------------------------------
  // FILTER COUNTS
  // --------------------------------------------------

  const upcomingAppointments = useMemo(() => {
    return appointments.filter(
      (appointment) => appointment.status === 'Scheduled'
    );
  }, [appointments]);

  const completedAppointments = useMemo(() => {
    return appointments.filter(
      (appointment) => appointment.status === 'Completed'
    );
  }, [appointments]);

  // --------------------------------------------------
  // ADD FORM
  // --------------------------------------------------

  const openAddForm = () => {
    setEditingAppointment(null);
    setForm(emptyForm);
    setError('');
    setSuccess('');
    setShowForm(true);
  };

  // --------------------------------------------------
  // EDIT FORM
  // --------------------------------------------------

  const openEditForm = (appointment) => {
    setEditingAppointment(appointment);

    setForm({
      date: appointment.date || '',
      time: appointment.time || '',
      title: appointment.title || '',
      description: appointment.description || '',
      location: appointment.location || '',
      status: appointment.status || 'Scheduled',
    });

    setError('');
    setSuccess('');
    setShowForm(true);
  };

  // --------------------------------------------------
  // CLOSE FORM
  // --------------------------------------------------

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingAppointment(null);
    setForm(emptyForm);
  };

  // --------------------------------------------------
  // FORM CHANGE
  // --------------------------------------------------

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // --------------------------------------------------
  // SAVE APPOINTMENT
  // --------------------------------------------------

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.date || !form.time || !form.title.trim()) {
      setError(
        'Date, time and appointment title are required.'
      );
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      // UPDATE
      if (editingAppointment) {
        const response = await axios.put(
          `/caregiver/appointments/${editingAppointment._id}`,
          form
        );

        setAppointments((previous) =>
          previous.map((appointment) =>
            appointment._id === editingAppointment._id
              ? response.data
              : appointment
          )
        );

        setSuccess(
          'Appointment updated successfully.'
        );
      }

      // ADD
      else {
        const response = await axios.post(
          '/caregiver/appointments',
          form
        );

        setAppointments((previous) => [
          ...previous,
          response.data,
        ]);

        setSuccess(
          'Appointment added successfully.'
        );
      }

      setShowForm(false);
      setEditingAppointment(null);
      setForm(emptyForm);
    } catch (err) {
      console.error('Save appointment error:', err);

      setError(
        err.response?.data?.message ||
          'Unable to save appointment. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // DELETE APPOINTMENT
  // --------------------------------------------------

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this appointment?'
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      setError('');
      setSuccess('');

      await axios.delete(
        `/caregiver/appointments/${id}`
      );

      setAppointments((previous) =>
        previous.filter(
          (appointment) => appointment._id !== id
        )
      );

      setSuccess(
        'Appointment deleted successfully.'
      );
    } catch (err) {
      console.error(
        'Delete appointment error:',
        err
      );

      setError(
        err.response?.data?.message ||
          'Unable to delete appointment. Please try again.'
      );
    } finally {
      setDeletingId(null);
    }
  };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* ==================================================
          HEADER
      ================================================== */}

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">

          <div className="flex items-center gap-4">

            <button
              type="button"
              onClick={() =>
                navigate('/caregiver/dashboard')
              }
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
              title="Back to Dashboard"
            >
              <ArrowLeft size={19} />
            </button>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                CAREMATE
              </p>

              <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
                Appointments
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage appointments for{' '}
                {user?.name || 'your patient'}
              </p>
            </div>

          </div>

          <button
            type="button"
            onClick={openAddForm}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus size={18} />

            <span className="hidden sm:inline">
              Add Appointment
            </span>

            <span className="sm:hidden">
              Add
            </span>
          </button>

        </div>
      </header>

      {/* ==================================================
          MAIN
      ================================================== */}

      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8">

        {/* SUCCESS MESSAGE */}

        {success && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-700">

            <CheckCircle2 size={19} />

            {success}

          </div>
        )}

        {/* ERROR MESSAGE */}

        {error && !showForm && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">

            <AlertCircle size={19} />

            {error}

          </div>
        )}

        {/* ==================================================
            SUMMARY CARDS
        ================================================== */}

        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

          {/* TOTAL */}

          <div className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-600 to-cyan-500 p-6 text-white shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-semibold text-blue-50">
                  Total Appointments
                </p>

                <p className="mt-2 text-4xl font-extrabold">
                  {appointments.length}
                </p>

              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                <CalendarDays size={24} />
              </div>

            </div>

          </div>

          {/* UPCOMING */}

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-semibold text-slate-500">
                  Upcoming
                </p>

                <p className="mt-2 text-4xl font-extrabold text-slate-900">
                  {upcomingAppointments.length}
                </p>

              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <CalendarCheck size={24} />
              </div>

            </div>

          </div>

          {/* COMPLETED */}

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-semibold text-slate-500">
                  Completed
                </p>

                <p className="mt-2 text-4xl font-extrabold text-slate-900">
                  {completedAppointments.length}
                </p>

              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={24} />
              </div>

            </div>

          </div>

        </section>

        {/* ==================================================
            APPOINTMENT LIST
        ================================================== */}

        <section className="mt-8">

          <div className="mb-5">

            <h2 className="text-xl font-extrabold text-slate-900">
              Patient Appointments
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Keep track of consultations, checkups and medical visits.
            </p>

          </div>

          {/* LOADING */}

          {loading ? (

            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">

              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

              <p className="mt-4 text-sm font-semibold text-slate-500">
                Loading appointments...
              </p>

            </div>

          ) : appointments.length === 0 ? (

            /* EMPTY STATE */

            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <CalendarDays size={30} />
              </div>

              <h3 className="mt-5 text-xl font-bold text-slate-900">
                No appointments yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Add the patient's upcoming doctor visits,
                consultations or checkups so they can be
                easily tracked.
              </p>

              <button
                type="button"
                onClick={openAddForm}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
              >
                <Plus size={18} />
                Add First Appointment
              </button>

            </div>

          ) : (

            /* APPOINTMENTS */

            <div className="space-y-4">

              {appointments.map((appointment) => (

                <article
                  key={appointment._id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6"
                >

                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                    <div className="flex min-w-0 gap-4">

                      {/* ICON */}

                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                        <Stethoscope size={25} />
                      </div>

                      {/* CONTENT */}

                      <div className="min-w-0">

                        <div className="flex flex-wrap items-center gap-3">

                          <h3 className="text-lg font-extrabold text-slate-900">
                            {appointment.title}
                          </h3>

                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-bold ${getStatusClasses(
                              appointment.status
                            )}`}
                          >
                            {appointment.status}
                          </span>

                        </div>

                        {appointment.description && (
                          <p className="mt-2 text-sm leading-6 text-slate-500">
                            {appointment.description}
                          </p>
                        )}

                        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-slate-600">

                          {/* DATE */}

                          <span className="flex items-center gap-2">

                            <CalendarDays
                              size={16}
                              className="text-blue-600"
                            />

                            {formatDate(
                              appointment.date
                            )}

                          </span>

                          {/* TIME */}

                          <span className="flex items-center gap-2">

                            <Clock3
                              size={16}
                              className="text-blue-600"
                            />

                            {appointment.time}

                          </span>

                          {/* LOCATION */}

                          {appointment.location && (
                            <span className="flex items-center gap-2">

                              <MapPin
                                size={16}
                                className="text-blue-600"
                              />

                              {appointment.location}

                            </span>
                          )}

                        </div>

                        {/* DOCTOR */}

                        {appointment.doctor?.name && (
                          <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-slate-600">

                            <Stethoscope
                              size={16}
                              className="text-cyan-600"
                            />

                            Dr. {appointment.doctor.name}

                          </div>
                        )}

                      </div>

                    </div>

                    {/* ACTION BUTTONS */}

                    <div className="flex shrink-0 items-center gap-2">

                      <button
                        type="button"
                        onClick={() =>
                          openEditForm(appointment)
                        }
                        className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                      >
                        <Pencil size={16} />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(
                            appointment._id
                          )
                        }
                        disabled={
                          deletingId === appointment._id
                        }
                        className="flex items-center gap-2 rounded-xl border border-red-100 px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 size={16} />

                        {deletingId === appointment._id
                          ? 'Deleting...'
                          : 'Delete'}
                      </button>

                    </div>

                  </div>

                </article>

              ))}

            </div>

          )}

        </section>

      </main>

      {/* ==================================================
          ADD / EDIT MODAL
      ================================================== */}

      {showForm && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">

            {/* MODAL HEADER */}

            <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5 sm:px-7">

              <div>

                <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                  CAREMATE
                </p>

                <h2 className="mt-1 text-xl font-extrabold text-slate-900">
                  {editingAppointment
                    ? 'Edit Appointment'
                    : 'Add Appointment'}
                </h2>

              </div>

              <button
                type="button"
                onClick={closeForm}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <X size={20} />
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="p-6 sm:p-7"
            >

              {/* FORM ERROR */}

              {error && (
                <div className="mb-5 flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">

                  <AlertCircle size={18} />

                  {error}

                </div>
              )}

              <div className="grid gap-5 sm:grid-cols-2">

                {/* DATE */}

                <div>

                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Date *
                  </label>

                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />

                </div>

                {/* TIME */}

                <div>

                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Time *
                  </label>

                  <input
                    type="time"
                    name="time"
                    value={form.time}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />

                </div>

                {/* TITLE */}

                <div className="sm:col-span-2">

                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Appointment Title *
                  </label>

                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Neurologist Consultation"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />

                </div>

                {/* LOCATION */}

                <div className="sm:col-span-2">

                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Location
                  </label>

                  <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="e.g. City Care Hospital"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />

                </div>

                {/* DESCRIPTION */}

                <div className="sm:col-span-2">

                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Description / Notes
                  </label>

                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Add any instructions or important details..."
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />

                </div>

                {/* STATUS */}

                <div className="sm:col-span-2">

                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Status
                  </label>

                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  >

                    <option value="Scheduled">
                      Scheduled
                    </option>

                    <option value="Completed">
                      Completed
                    </option>

                    <option value="Cancelled">
                      Cancelled
                    </option>

                  </select>

                </div>

              </div>

              {/* BUTTONS */}

              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {saving ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Saving...
                    </>
                  ) : (
                    <>
                      {editingAppointment ? (
                        <Pencil size={17} />
                      ) : (
                        <Plus size={17} />
                      )}

                      {editingAppointment
                        ? 'Update Appointment'
                        : 'Save Appointment'}
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
};

export default Appointments;