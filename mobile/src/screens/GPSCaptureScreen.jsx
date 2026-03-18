import * as Location from "expo-location";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { Pressable, SafeAreaView, Text, View } from "react-native";
import { useSurveyDraft } from "../context/SurveyDraftContext.jsx";

export const GPSCaptureScreen = () => {
  const navigation = useNavigation();
  const { draft, setGpsLocation } = useSurveyDraft();
  const [loading, setLoading] = useState(false);

  const captureLocation = async () => {
    setLoading(true);
    const permission = await Location.requestForegroundPermissionsAsync();

    if (!permission.granted) {
      setLoading(false);
      return;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced
    });

    setGpsLocation({
      type: "Point",
      coordinates: [location.coords.longitude, location.coords.latitude],
      accuracy: location.coords.accuracy
    });
    setLoading(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc", padding: 16 }}>
      <View style={{ gap: 16 }}>
        <View style={{ backgroundColor: "#ffffff", borderRadius: 22, padding: 18 }}>
          <Text style={{ fontSize: 22, fontWeight: "700", color: "#0f172a" }}>GPS capture</Text>
          <Text style={{ marginTop: 6, color: "#475569" }}>Capture coordinates automatically before final submission.</Text>
        </View>
        <Pressable onPress={captureLocation} style={{ borderRadius: 14, backgroundColor: "#12453f", padding: 16 }}>
          <Text style={{ textAlign: "center", fontWeight: "700", color: "#ffffff" }}>
            {loading ? "Capturing..." : "Capture Current Location"}
          </Text>
        </Pressable>
        {draft.gpsLocation ? (
          <View style={{ backgroundColor: "#ffffff", borderRadius: 18, padding: 16, gap: 6 }}>
            <Text style={{ color: "#0f172a", fontWeight: "700" }}>Latitude: {draft.gpsLocation.coordinates[1]}</Text>
            <Text style={{ color: "#0f172a", fontWeight: "700" }}>Longitude: {draft.gpsLocation.coordinates[0]}</Text>
            <Text style={{ color: "#475569" }}>Accuracy: {draft.gpsLocation.accuracy} meters</Text>
          </View>
        ) : null}
        <Pressable
          onPress={() => navigation.navigate("SubmitSurvey")}
          style={{ borderRadius: 14, backgroundColor: "#e6b84a", padding: 16 }}
        >
          <Text style={{ textAlign: "center", fontWeight: "700", color: "#0f172a" }}>Continue to Submit</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

