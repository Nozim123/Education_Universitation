import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;
type University = Tables<"universities">;

interface StudentRanking extends Profile {
  university?: University | null;
  rank?: number;
  previousRank?: number;
}

interface UniversityRanking extends University {
  rank?: number;
  previousRank?: number;
}

export const useLeaderboard = () => {
  const [students, setStudents] = useState<StudentRanking[]>([]);
  const [universities, setUniversities] = useState<UniversityRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<"week" | "month" | "year" | "all">("month");

  // Store previous rankings for animation
  const [prevStudentRanks, setPrevStudentRanks] = useState<Record<string, number>>({});
  const [prevUniversityRanks, setPrevUniversityRanks] = useState<Record<string, number>>({});

  // Fetch student rankings
  const fetchStudents = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          *,
          university:universities(*)
        `)
        .order("total_points", { ascending: false })
        .limit(100);

      if (error) throw error;

      const rankedStudents = (data || []).map((student, index) => ({
        ...student,
        university: student.university as University | null,
        rank: index + 1,
        previousRank: prevStudentRanks[student.id] || index + 1,
      }));

      // Update previous ranks for next comparison
      const newPrevRanks: Record<string, number> = {};
      rankedStudents.forEach((s) => {
        newPrevRanks[s.id] = s.rank!;
      });
      setPrevStudentRanks(newPrevRanks);

      setStudents(rankedStudents);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  }, [prevStudentRanks]);

  // Fetch university rankings
  const fetchUniversities = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("universities")
        .select("*")
        .order("total_points", { ascending: false })
        .limit(50);

      if (error) throw error;

      const rankedUniversities = (data || []).map((uni, index) => ({
        ...uni,
        rank: index + 1,
        previousRank: prevUniversityRanks[uni.id] || index + 1,
      }));

      // Update previous ranks
      const newPrevRanks: Record<string, number> = {};
      rankedUniversities.forEach((u) => {
        newPrevRanks[u.id] = u.rank!;
      });
      setPrevUniversityRanks(newPrevRanks);

      setUniversities(rankedUniversities);
    } catch (error) {
      console.error("Error fetching universities:", error);
    }
  }, [prevUniversityRanks]);

  // Fetch all data
  const fetchData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchStudents(), fetchUniversities()]);
    setLoading(false);
  }, [fetchStudents, fetchUniversities]);

  // Initial load
  useEffect(() => {
    fetchData();
  }, []);

  // Refetch when filter changes (for future time-based filtering)
  useEffect(() => {
    fetchData();
  }, [timeFilter]);

  // Real-time subscription for profile updates
  useEffect(() => {
    const channel = supabase
      .channel("leaderboard-profiles")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
        },
        () => {
          // Only update students, preserving animation data
          fetchStudents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchStudents]);

  // Real-time subscription for university updates
  useEffect(() => {
    const channel = supabase
      .channel("leaderboard-universities")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "universities",
        },
        () => {
          fetchUniversities();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchUniversities]);

  return {
    students,
    universities,
    loading,
    timeFilter,
    setTimeFilter,
    refetch: fetchData,
  };
};
