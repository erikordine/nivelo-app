import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, rtdb } from "../../../firebase/config";

// rótulos e formatação
const nomeContexto = (c) =>
  ({ jejum: "jejum", pre: "pré", pos: "pós", random: "aleatório" }[c] || c);
const horaMinutos = (ts) => {
  if (!ts) return "--:--";
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
};

export default function History() {
  const [itens, setItens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);

  // ------------------------------------------------
  // FUNÇÕES DE INTERAÇÃO (Deletar e Editar)
  // ------------------------------------------------

  // iniciar a edição (toque curto)
  const editar = (id) => {
    router.push(`../../src/screens/NewLogUploadScreen?id=${id}`);
  };

  // excluir (toque longo)
  const excluir = (id) => {
    const user = auth.currentUser;
    if (!user) return;
    Alert.alert(
      "Excluir registro",
      "Tem certeza que deseja excluir este registro?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () =>
            rtdb
              .ref(`users/${user.uid}/logs/${id}`)
              .remove()
              .catch((e) =>
                Alert.alert("Erro", e?.message || "Falha ao excluir")
              ),
        },
      ]
    );
  };

  // puxar para atualizar (força uma leitura única)
  const onRefresh = () => {
    setAtualizando(true);
    const user = auth.currentUser;
    if (!user) return setAtualizando(false);

    rtdb
      .ref(`users/${user.uid}/logs`)
      .orderByChild("createdAt")
      .limitToLast(100)
      .once("value")
      .then((snap) => {
        const obj = snap.val() || {};
        const lista = Object.entries(obj).map(([id, v]) => ({ id, ...v }));
        lista.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setItens(lista);
      })
      .finally(() => setAtualizando(false));
  };

  // ------------------------------------------------
  // BUSCA DE DADOS (LISTENER)
  // ------------------------------------------------

  // carrega e mantém o listener
  const ligarListener = useCallback(() => {
    const user = auth.currentUser;
    if (!user) {
      setItens([]);
      setCarregando(false);
      return () => {};
    }

    const ref = rtdb
      .ref(`users/${user.uid}/logs`)
      .orderByChild("createdAt")
      .limitToLast(100);

    const onValue = (snap) => {
      const obj = snap.val() || {};
      const lista = Object.entries(obj).map(([id, v]) => ({ id, ...v }));
      // mais novo primeiro
      lista.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setItens(lista);
      setCarregando(false);
      setAtualizando(false);
    };

    ref.on("value", onValue);
    return () => ref.off("value", onValue);
  }, []);

  // reata o listener quando o usuário logar
  useEffect(() => {
    const offAuth = auth.onAuthStateChanged(() => {
      setCarregando(true);
      const offDB = ligarListener();
      return offDB;
    });
    return () => offAuth();
  }, [ligarListener]);

  // ------------------------------------------------
  // RENDERIZAÇÃO DE ITENS
  // ------------------------------------------------

  // Componente interno para garantir que a lógica de badges retorne um componente
  const RenderBadges = ({ item }) => {
    if (!item.carboidrato && !item.insulina) {
      return null;
    }

    return (
      <View style={s.badgeContainer}>
        {!!item.carboidrato && (
          <Text style={s.badge}>Carb {item.carboidrato} g</Text>
        )}
        {!!item.insulina && <Text style={s.badge}>Ins {item.insulina} U</Text>}
      </View>
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={s.linha}
      onPress={() => editar(item.id)}
      onLongPress={() => excluir(item.id)}
    >
      <View style={s.logContent}>
        {/* LINHA PRINCIPAL */}
        <View style={s.linhaPrincipal}>
          <View style={s.left}>
            <Ionicons name="water-outline" size={18} color="#22C55E" />
            <Text style={s.txt}>
              {item.glicose} mg/dL • {nomeContexto(item.context)} •{" "}
              {horaMinutos(item.createdAt)}
            </Text>
          </View>
          <View style={s.right}>
            {/* badges rápidos usando o componente seguro */}
            <RenderBadges item={item} />
            {/* Ícone de navegação/edição */}
            <Ionicons
              name="chevron-forward-outline"
              size={20}
              color="#9CA3AF"
            />
          </View>
        </View>

        {/* ANOTAÇÃO (NOVO) */}
        {item.note ? (
          <View style={s.noteRow}>
            <Ionicons name="create-outline" size={14} color="#9CA3AF" />
            <Text style={s.noteText}>{item.note}</Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={s.container}>
      {/* topo simples */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
          <Ionicons name="arrow-back" size={22} color="#9CA3AF" />
        </TouchableOpacity>
        <Text style={s.titulo}>Histórico</Text>
        <View style={{ width: 30 }} />
      </View>

      <FlatList
        data={itens}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        ListEmptyComponent={
          carregando
          ? <Text style={{ color: '#E5E7EB' }}>Carregando...</Text>
          : <Text style={{ color: '#E5E7EB' }}>Sem registros</Text>
        }
        refreshControl={
          <RefreshControl
            refreshing={atualizando}
            onRefresh={onRefresh}
            tintColor="#22C55E"
          />
        }
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#111827",
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#132033",
  },
  titulo: { color: "#E5E7EB", fontWeight: "800", fontSize: 18 },
  linha: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1f2937",
  },
  logContent: {
    width: "100%",
  },
  linhaPrincipal: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  noteRow: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 2,
    paddingLeft: 4,
  },
  noteText: {
    color: "#9CA3AF",
    fontSize: 13,
    marginLeft: 4,
  },
  left: { flexDirection: "row", alignItems: "center" },
  right: { flexDirection: "row", alignItems: "center" },
  badgeContainer: { flexDirection: "row", marginRight: 8 },
  txt: { color: "#E5E7EB", marginLeft: 8 },
  badge: {
    color: "#9CA3AF",
    fontSize: 12,
    backgroundColor: "#1f2937",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  vazio: { color: "#9CA3AF", padding: 16 },
});
