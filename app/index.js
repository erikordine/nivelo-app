// app/index.js  (ou index.tsx)
import { Redirect } from "expo-router";
// import LoginScreen from "./src/screens/LoginScreen";

export default function Index() {
  // return <LoginScreen />;
  return <Redirect href="/src/(tabs)/home"/>;
  // return <LoginScreen />;
}
