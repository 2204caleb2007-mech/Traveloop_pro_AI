import { useEffect, useState } from "react";
import { tripStore, auth, type Trip, type User } from "@/lib/tripStore";
import { packingStore, type PackingItem } from "@/lib/packingStore";
import { notesStore, type TripNote } from "@/lib/notesStore";
import { profileStore, budgetStore, type UserProfile, type BudgetEntry } from "@/lib/mockData";

export function useTrips() {
  const [trips, setTrips] = useState(() => tripStore.getAll());
  useEffect(() => {
    setTrips(tripStore.getAll());
    return tripStore.subscribe(() => setTrips(tripStore.getAll()));
  }, []);
  return trips;
}

export function useTrip(id: string) {
  const [trip, setTrip] = useState(() => tripStore.getById(id));
  useEffect(() => {
    setTrip(tripStore.getById(id));
    return tripStore.subscribe(() => setTrip(tripStore.getById(id)));
  }, [id]);
  return trip;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => auth.getUser());
  useEffect(() => {
    return auth.subscribe(() => setUser(auth.getUser()));
  }, []);
  return { user, isLoggedIn: !!user };
}

export function usePacking(tripId: string) {
  const [items, setItems] = useState<PackingItem[]>(() => packingStore.getByTrip(tripId));
  useEffect(() => {
    setItems(packingStore.getByTrip(tripId));
    return packingStore.subscribe(() => setItems(packingStore.getByTrip(tripId)));
  }, [tripId]);
  return items;
}

export function useNotes(tripId: string) {
  const [notes, setNotes] = useState<TripNote[]>(() => notesStore.getByTrip(tripId));
  useEffect(() => {
    setNotes(notesStore.getByTrip(tripId));
    return notesStore.subscribe(() => setNotes(notesStore.getByTrip(tripId)));
  }, [tripId]);
  return notes;
}

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile>(() => profileStore.get());
  useEffect(() => {
    return profileStore.subscribe(() => setProfile(profileStore.get()));
  }, []);
  return profile;
}

export function useBudget(tripId: string) {
  const [entries, setEntries] = useState<BudgetEntry[]>(() => budgetStore.getByTrip(tripId));
  const [limit, setLimit] = useState<number | null>(() => budgetStore.getLimit(tripId));
  useEffect(() => {
    setEntries(budgetStore.getByTrip(tripId));
    setLimit(budgetStore.getLimit(tripId));
    return budgetStore.subscribe(() => {
      setEntries(budgetStore.getByTrip(tripId));
      setLimit(budgetStore.getLimit(tripId));
    });
  }, [tripId]);
  return { entries, limit };
}
