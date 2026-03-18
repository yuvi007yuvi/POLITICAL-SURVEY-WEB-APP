import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../context/AuthContext.jsx";
import { CameraUploadScreen } from "../screens/CameraUploadScreen.jsx";
import { GPSCaptureScreen } from "../screens/GPSCaptureScreen.jsx";
import { LoginScreen } from "../screens/LoginScreen.jsx";
import { ProjectListScreen } from "../screens/ProjectListScreen.jsx";
import { SubmitScreen } from "../screens/SubmitScreen.jsx";
import { SurveyFormScreen } from "../screens/SurveyFormScreen.jsx";
import { VoiceRecordScreen } from "../screens/VoiceRecordScreen.jsx";

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  const { bootstrapping, isAuthenticated } = useAuth();

  if (bootstrapping) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#12453f" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerBackTitleVisible: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      ) : (
        <>
          <Stack.Screen name="Projects" component={ProjectListScreen} />
          <Stack.Screen name="SurveyForm" component={SurveyFormScreen} options={{ title: "Survey Form" }} />
          <Stack.Screen name="CameraUpload" component={CameraUploadScreen} options={{ title: "Camera Upload" }} />
          <Stack.Screen name="VoiceRecord" component={VoiceRecordScreen} options={{ title: "Voice Recording" }} />
          <Stack.Screen name="GPSCapture" component={GPSCaptureScreen} options={{ title: "GPS Capture" }} />
          <Stack.Screen name="SubmitSurvey" component={SubmitScreen} options={{ title: "Submit Survey" }} />
        </>
      )}
    </Stack.Navigator>
  );
};

