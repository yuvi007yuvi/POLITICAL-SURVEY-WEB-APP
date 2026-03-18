import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { useSurveyDraft } from "../context/SurveyDraftContext.jsx";
import { surveyService } from "../services/surveyService.js";

export const SubmitScreen = () => {
  const navigation = useNavigation();
  const { draft, resetDraft } = useSurveyDraft();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    const result = await surveyService.submitOrQueue(draft);
    setLoading(false);
    setMessage(result.queued ? result.message : "Survey submitted successfully");
    resetDraft();
    navigation.navigate("Projects");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={{ backgroundColor: "#ffffff", borderRadius: 22, padding: 18, gap: 14 }}>
          <Text style={{ fontSize: 22, fontWeight: "700", color: "#0f172a" }}>Submit survey</Text>
          <Text style={{ color: "#475569" }}>Project: {draft.projectName}</Text>
          <Text style={{ color: "#475569" }}>Answers: {draft.answers.length}</Text>
          <Text style={{ color: "#475569" }}>Photos: {draft.photos.length}</Text>
          <Text style={{ color: "#475569" }}>Voice attached: {draft.voiceRecording ? "Yes" : "No"}</Text>
          <Text style={{ color: "#475569" }}>GPS captured: {draft.gpsLocation ? "Yes" : "No"}</Text>
          {message ? <Text style={{ color: "#12453f", fontWeight: "700" }}>{message}</Text> : null}
          <Pressable onPress={submit} style={{ borderRadius: 14, backgroundColor: "#12453f", padding: 16 }}>
            <Text style={{ textAlign: "center", fontWeight: "700", color: "#ffffff" }}>
              {loading ? "Submitting..." : "Submit Survey"}
            </Text>
          </Pressable>
          <Pressable onPress={() => navigation.navigate("Projects")} style={{ borderRadius: 14, backgroundColor: "#e2e8f0", padding: 16 }}>
            <Text style={{ textAlign: "center", fontWeight: "700", color: "#0f172a" }}>Back to Projects</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
