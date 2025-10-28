import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, rtdb } from "../../../firebase/config";

// Funções de ajuda
const nomeContexto = (c) =>
  ({ jejum: "jejum", pre: "pré", pos: "pós", random: "aleatório" }[c] || c);

const horaMinutos = (ts) => {
  if (!ts) return "-";
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
};

export default function Dashboard() {
  const [logs, setLogs] = useState([]); // Ultimo registro
  const [ultimo, setUltimo] = useState({}); // Ultimo (mais recente)

  // NOVO: Usa useFocusEffect para rodar a lógica SEMPRE que a tela ganha foco
  useFocusEffect(
    useCallback(() => {
      // Verifica quem é o usuario
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      // limpa o estado ao focar
      setLogs([]);
      setUltimo(undefined);

      const ref = rtdb
        .ref(`users/${uid}/logs`)
        .orderByChild("createdAt")
        .limitToLast(5);

      const handleSnap = (snap) => {
        const obj = snap.val() || {}; // Evita erro quando vazio

        const lista = Object.entries(obj).map(([id, value]) => {
          // Lógica de fallback para pegar o timestamp correto
          const timestamp = value.createdAt || value.createAt; // Tenta 'createdAt', se não achar, usa 'createAt'
          return { id, ...value, createdAt: timestamp }; // Padroniza para 'createdAt' no estado do React
        });

        // Ordena usando o timestamp padronizado (do mais recente para o mais antigo)
        lista.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

        setLogs(lista);
        setUltimo(lista[0]);
      };

      // 1. Liga o listener quando a tela está focada
      ref.on("value", handleSnap);

      // 2. Retorna a função de limpeza que desliga o listener quando a tela perde o foco
      return () => ref.off("value", handleSnap);

      // A lista de dependências está vazia, pois o listener é gerenciado pelo foco
    }, [])
  );

  return (
    // ... O restante do componente permanece inalterado
    <ScrollView
      style={s.container}
      contentContainerStyle={s.contentContainer}
      showsVerticalScrollIndicator={false}
    >
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
        <Text style={s.bigValue}>
          {ultimo?.glicose != null ? ultimo.glicose : "-"}
        </Text>
        <Text style={s.unit}>mg/dL</Text>
        <Text style={s.subtle}>
          {ultimo
            ? `${nomeContexto(ultimo.context)} • ${horaMinutos(
                ultimo.createdAt
              )}`
            : ""}
        </Text>
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

        <TouchableOpacity
          style={s.card}
          onPress={() => router.push("/src/wda")}
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

      {/* Lista de registros */}
      {logs.length === 0 ? (
        <Text style={{ color: "#9CA3AF", marginLeft: 6 }}>
          Sem registros ainda
        </Text>
      ) : (
        // Mapeia os registros
        logs.map((log) => (
          <View key={log.id} style={s.logRow}>
            <Ionicons name="water-outline" size={18} color="#22C55E" />
            <Text style={s.logText}>
              {log.glicose} mg/dL • {nomeContexto(log.context)} •{" "}
              {horaMinutos(log.createdAt)}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  // O container agora usa a altura total da tela, permitindo que a ScrollView funcione.
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
    // Não tem mais padding aqui, movemos para contentContainerStyle
  },
  // NOVO estilo para dar espaçamento interno ao conteúdo
  contentContainer: {
    padding: 16,
    paddingBottom: 50, // Adiciona espaço extra para que o último item não fique escondido pela Tab Bar
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
  // lista de recentes
  logRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  logText: {
    color: "#E5E7EB",
    marginLeft: 8,
  },
});
