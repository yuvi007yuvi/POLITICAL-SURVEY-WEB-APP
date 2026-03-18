import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { FlatList, Pressable, SafeAreaView, Text, View } from "react-native";
import { useAuth } from "../context/AuthContext.jsx";
import { useSurveyDraft } from "../context/SurveyDraftContext.jsx";
import { offlineQueue } from "../services/offlineQueue.js";
import { projectService } from "../services/projectService.js";
import { surveyService } from "../services/surveyService.js";

export const ProjectListScreen = () => {
  const navigation = useNavigation();
  const { logout, session } = useAuth();
  const { startDraft } = useSurveyDraft();
  const [projects, setProjects] = useState([]);
  const [queueCount, setQueueCount] = useState(0);

  const load = useCallback(async () => {
    const [projectList, queue] = await Promise.all([projectService.list(), offlineQueue.list()]);
    setProjects(projectList);
    setQueueCount(queue.length);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const syncPending = async () => {
    await surveyService.syncPending();
    await load();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc", padding: 16 }}>
      <View style={{ gap: 16 }}>
        <View style={{ backgroundColor: "#12453f", padding: 18, borderRadius: 22 }}>
          <Text style={{ color: "#d9ebe7", letterSpacing: 2, textTransform: "uppercase", fontSize: 12 }}>Field Mobile</Text>
          <Text style={{ color: "#ffffff", fontSize: 26, fontWeight: "700", marginTop: 8 }}>{session?.user?.name}</Text>
          <Text style={{ color: "#d9ebe7", marginTop: 6 }}>Assigned projects: {projects.length}</Text>
        </View>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Pressable onPress={syncPending} style={{ flex: 1, borderRadius: 14, backgroundColor: "#e6b84a", padding: 14 }}>
            <Text style={{ fontWeight: "700", textAlign: "center", color: "#0f172a" }}>Sync Pending ({queueCount})</Text>
          </Pressable>
          <Pressable onPress={logout} style={{ flex: 1, borderRadius: 14, backgroundColor: "#ffffff", padding: 14 }}>
            <Text style={{ fontWeight: "700", textAlign: "center", color: "#0f172a" }}>Logout</Text>
          </Pressable>
        </View>
      </View>
      <FlatList
        data={projects}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingTop: 20, gap: 14 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
              startDraft(item);
              navigation.navigate("SurveyForm", { project: item });
            }}
            style={{ backgroundColor: "#ffffff", borderRadius: 22, padding: 18, gap: 8 }}
          >
            <Text style={{ fontSize: 18, fontWeight: "700", color: "#0f172a" }}>{item.name}</Text>
            <Text style={{ color: "#475569" }}>{item.description || "No description available"}</Text>
            <Text style={{ color: "#12453f", fontWeight: "600" }}>Fields: {item.formDefinition.length}</Text>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
};

