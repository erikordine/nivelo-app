// Dashboard.jsx
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";


export default function Dashboard() {
  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.brandRow}>
        <View style={s.brandLeft}>
          <Image
            source={require("../assets/images/nivelo_logo.png")}
            style={s.brandLogo}
          />
          <Image
            source={require("../assets/images/nivelo_name.png")}
            style={s.brandName}
          />
        </View>

        <TouchableOpacity
          onPress={() => router.push("../screens/Config")}
          style={s.iconButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.7}
        >
          <Ionicons name="settings-outline" size={22} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      <View style={s.cardBig}>
        <Text style={s.bigValue}>112</Text>
        <Text style={s.unit}>mg/dL</Text>
        <Text style={s.subtle}>pós-refeição • hoje 01:44</Text>
        <View style={s.badgeNormal}>
          <Text style={s.badgeText}>Normal</Text>
        </View>
      </View>

      {/* Atalhos */}
      <View style={s.row}>
        <TouchableOpacity
          style={s.card}
          onPress={() => router.push("/src/new-log")}
        >
          <Ionicons name="add-circle" size={28} color="#22C55E" />
          <Text style={s.cardText}>Novo Registro</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.card}
          onPress={() => router.push("/src/history")}
        >
          <Ionicons name="stats-chart" size={28} color="#22C55E" />
          <Text style={s.cardText}>Histórico</Text>
        </TouchableOpacity>
      </View>

      <View style={s.row}>
        <TouchableOpacity
          style={s.card}
          onPress={() => router.push("/src/metas")}
        >
          <Ionicons name="flag-outline" size={28} color="#22C55E" />
          <Text style={s.cardText}>Metas</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.card}
          onPress={() => router.push("../screens/Config")}
        >
          <Ionicons name="settings" size={28} color="#22C55E" />
          <Text style={s.cardText}>Configurações</Text>
        </TouchableOpacity>
      </View>

      <Text style={s.sectionTitle}>Registros recentes</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
    padding: 16,
  },
  
  /* HEADER */
  brandRow: {
    padding: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: -16,
    marginBottom: 12,
    backgroundColor: "#111827",
    marginHorizontal: -16,
    paddingHorizontal: 5,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: "#132033",
  },
  brandLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  brandLogo: {
    width: 70,
    height: 70,
    resizeMode: "contain",
    top: 8,
  },
  brandName: {
    width: 80,
    height: 80,
    resizeMode: "contain",
    top: 10,
  },
  iconButton: {
    padding: 8,
    borderRadius: 999,
    top: 5,
    right: 6,
  },
  row: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  card: {
    flex: 1,
    backgroundColor: "#111827",
    borderRadius: 12,
    borderColor: "#0d4e25ff",
    borderWidth: 1,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  cardText: {
    color: "#E5E7EB",
    marginTop: 8,
    fontWeight: "600",
  },
  cardBig: {
    backgroundColor: "#111827",
    borderRadius: 16,
    paddingVertical: 30,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#0d4e25ff",
    alignItems: "center",
    marginTop: 14,
    marginBottom: 16,
  },
  bigValue: {
    color: "#22C55E",
    fontSize: 58,
    fontWeight: "900",
    lineHeight: 62,
    paddingBottom: 4,
  },
  unit: {
    color: "#9CA3AF",
    marginTop: -1,
    marginBottom: 6,
    fontSize: 18,
  },
  subtle: {
    color: "#9CA3AF",
    paddingBottom: 20,
    top: 10,
  },
  badgeNormal: {
    marginTop: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "#0b2b1a",
    borderWidth: 1,
    borderColor: "#14532d",
  },
  badgeText: {
    color: "#22C55E",
    fontWeight: "700",
  },
  sectionTitle: {
    color: "#E5E7EB",
    fontSize: 16,
    fontWeight: "800",
    marginTop: 8,
    marginBottom: 8,
  },
});
