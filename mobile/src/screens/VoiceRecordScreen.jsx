import { Audio } from "expo-av";
import { useNavigation } from "@react-navigation/native";
import { useRef, useState } from "react";
import { Pressable, SafeAreaView, Text, View } from "react-native";
import { useSurveyDraft } from "../context/SurveyDraftContext.jsx";

export const VoiceRecordScreen = () => {
  const navigation = useNavigation();
  const { draft, setVoiceRecording } = useSurveyDraft();
  const [recordingState, setRecordingState] = useState("idle");
  const recordingRef = useRef(null);

  const startRecording = async () => {
    const permission = await Audio.requestPermissionsAsync();
    if (!permission.granted) {
      return;
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true
    });

    const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    recordingRef.current = recording;
    setRecordingState("recording");
  };

  const stopRecording = async () => {
    if (!recordingRef.current) {
      return;
    }

    await recordingRef.current.stopAndUnloadAsync();
    const uri = recordingRef.current.getURI();
    setVoiceRecording({
      uri,
      mimeType: "audio/m4a"
    });
    recordingRef.current = null;
    setRecordingState("done");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc", padding: 16 }}>
      <View style={{ gap: 16 }}>
        <View style={{ backgroundColor: "#ffffff", borderRadius: 22, padding: 18 }}>
          <Text style={{ fontSize: 22, fontWeight: "700", color: "#0f172a" }}>Voice recording</Text>
          <Text style={{ marginTop: 6, color: "#475569" }}>Store one voice note per submission for verification and auditing.</Text>
        </View>
        <Pressable
          onPress={recordingState === "recording" ? stopRecording : startRecording}
          style={{ borderRadius: 18, backgroundColor: recordingState === "recording" ? "#dc2626" : "#12453f", padding: 22 }}
        >
          <Text style={{ textAlign: "center", fontSize: 18, fontWeight: "700", color: "#ffffff" }}>
            {recordingState === "recording" ? "Stop Recording" : "Start Recording"}
          </Text>
        </Pressable>
        <Text style={{ color: "#334155" }}>
          Current status: {recordingState === "done" && draft.voiceRecording ? "Recording captured" : recordingState}
        </Text>
        <Pressable
          onPress={() => navigation.navigate("GPSCapture")}
          style={{ borderRadius: 14, backgroundColor: "#e6b84a", padding: 16 }}
        >
          <Text style={{ textAlign: "center", fontWeight: "700", color: "#0f172a" }}>Continue to GPS Capture</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

