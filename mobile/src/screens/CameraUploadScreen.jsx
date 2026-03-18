import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import { Image, Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { useSurveyDraft } from "../context/SurveyDraftContext.jsx";

export const CameraUploadScreen = () => {
  const navigation = useNavigation();
  const { addPhoto, draft } = useSurveyDraft();

  const capture = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.6,
      allowsEditing: false
    });

    if (result.canceled) {
      return;
    }

    const asset = result.assets[0];
    const compressed = await ImageManipulator.manipulateAsync(
      asset.uri,
      [{ resize: { width: 1280 } }],
      { compress: 0.65, format: ImageManipulator.SaveFormat.JPEG }
    );

    addPhoto({
      uri: compressed.uri,
      mimeType: "image/jpeg"
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc", padding: 16 }}>
      <View style={{ flex: 1, gap: 16 }}>
        <View style={{ backgroundColor: "#ffffff", borderRadius: 22, padding: 18 }}>
          <Text style={{ fontSize: 22, fontWeight: "700", color: "#0f172a" }}>Camera evidence</Text>
          <Text style={{ marginTop: 6, color: "#475569" }}>Capture compressed photos to keep uploads small on free-tier bandwidth.</Text>
        </View>
        <Pressable onPress={capture} style={{ borderRadius: 14, backgroundColor: "#e6b84a", padding: 16 }}>
          <Text style={{ textAlign: "center", fontWeight: "700", color: "#0f172a" }}>Open Camera</Text>
        </Pressable>
        <ScrollView horizontal contentContainerStyle={{ gap: 12 }}>
          {draft.photos.map((photo, index) => (
            <Image key={`${photo.uri}-${index}`} source={{ uri: photo.uri }} style={{ width: 160, height: 160, borderRadius: 18 }} />
          ))}
        </ScrollView>
        <Pressable
          onPress={() => navigation.navigate("VoiceRecord")}
          style={{ borderRadius: 14, backgroundColor: "#12453f", padding: 16, marginTop: "auto" }}
        >
          <Text style={{ textAlign: "center", fontWeight: "700", color: "#ffffff" }}>Continue to Voice Recording</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

