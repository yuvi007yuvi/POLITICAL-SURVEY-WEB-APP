import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "./src/context/AuthContext.jsx";
import { SurveyDraftProvider } from "./src/context/SurveyDraftContext.jsx";
import { AppNavigator } from "./src/navigation/AppNavigator.jsx";

export default function App() {
  return (
    <AuthProvider>
      <SurveyDraftProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <AppNavigator />
        </NavigationContainer>
      </SurveyDraftProvider>
    </AuthProvider>
  );
}

