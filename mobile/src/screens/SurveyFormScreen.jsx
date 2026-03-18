import { useNavigation, useRoute } from "@react-navigation/native";
import { useMemo, useState } from "react";
import { Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { FieldRenderer } from "../components/FieldRenderer.jsx";
import { useSurveyDraft } from "../context/SurveyDraftContext.jsx";

export const SurveyFormScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { draft, updateAnswers } = useSurveyDraft();
  const project = route.params.project;

  const initialAnswers = useMemo(
    () =>
      project.formDefinition.map((field) => {
        const existing = draft.answers.find((answer) => answer.fieldId === field.fieldId);
        return existing || { fieldId: field.fieldId, label: field.label, value: "" };
      }),
    [draft.answers, project.formDefinition]
  );

  const [answers, setAnswers] = useState(initialAnswers);

  const updateValue = (fieldId, value) => {
    setAnswers((current) =>
      current.map((answer) => (answer.fieldId === fieldId ? { ...answer, value } : answer))
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={{ backgroundColor: "#ffffff", borderRadius: 22, padding: 18 }}>
          <Text style={{ fontSize: 22, fontWeight: "700", color: "#0f172a" }}>{project.name}</Text>
          <Text style={{ marginTop: 6, color: "#475569" }}>Dynamic form generated from the admin dashboard.</Text>
          <View style={{ marginTop: 20 }}>
            {project.formDefinition.map((field) => (
              <FieldRenderer
                key={field.fieldId}
                field={field}
                value={answers.find((answer) => answer.fieldId === field.fieldId)?.value}
                onChange={(value) => updateValue(field.fieldId, value)}
              />
            ))}
          </View>
          <Pressable
            onPress={() => {
              updateAnswers(answers);
              navigation.navigate("CameraUpload");
            }}
            style={{ marginTop: 12, borderRadius: 14, backgroundColor: "#12453f", padding: 16, alignItems: "center" }}
          >
            <Text style={{ color: "#ffffff", fontWeight: "700" }}>Continue to Camera Upload</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

