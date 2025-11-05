// IMPORTAÇÕES NECESSÁRIAS
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
// Importações do Firebase
import { auth, firebase, rtdb } from "../../../firebase/config";

// Valores padrão caso o usuário ainda não tenha salvo
const DEFAULT_METAS = {
  targetMin: 70,  // Glicemia baixa
  targetMax: 180, // Glicemia alta
  dangerLow: 55,  // Hipoglicemia de urgência
};

export default function MetasScreen() {
  const [metas, setMetas] = useState(DEFAULT_METAS);
  const [loading, setLoading] = useState(true); // Carregando dados
  const [saving, setSaving] = useState(false); // Salvando

  // Referência para o nó no RTDB
  const getMetasRef = () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return null;
    return rtdb.ref(`users/${uid}/metas`);
  };

  // 1. CARREGAR DADOS
  useEffect(() => {
    const metasRef = getMetasRef();
    if (!metasRef) {
      setLoading(false);
      return;
    }

    metasRef
      .once("value")
      .then((snapshot) => {
        const data = snapshot.val();
        if (data) {
          // Se houver dados, usa-os
          setMetas(data);
        } else {
          // Se não houver, usa os padrões (mas não os salva ainda)
          setMetas(DEFAULT_METAS);
        }
      })
      .catch((e) => {
        console.error("Erro ao carregar metas:", e);
        Alert.alert("Erro", "Não foi possível carregar os parâmetros.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // 2. SALVAR DADOS
  const saveMetas = async () => {
    const metasRef = getMetasRef();
    if (!metasRef) {
      return Alert.alert("Erro", "Usuário não autenticado.");
    }

    // Validação simples (garante que são números)
    const min = Number(metas.targetMin);
    const max = Number(metas.targetMax);
    const danger = Number(metas.dangerLow);

    if (!min || !max || !danger || min >= max || danger >= min) {
      return Alert.alert(
        "Valores Inválidos",
        "Verifique os valores. O mínimo deve ser menor que o máximo."
      );
    }

    setSaving(true);
    try {
      await metasRef.update({
        targetMin: min,
        targetMax: max,
        dangerLow: danger,
        updatedAt: firebase.database.ServerValue.TIMESTAMP,
      });
      Alert.alert("Sucesso", "Parâmetros salvos!");
      router.back();
    } catch (e) {
      console.error("Erro ao salvar metas:", e);
      Alert.alert("Erro", "Não foi possível salvar os parâmetros.");
    } finally {
      setSaving(false);
    }
  };

  // Função auxiliar para atualizar o estado
  const setMetaValor = (key, value) => {
    setMetas((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  if (loading) {
    return (
      <View style={[s.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#22C55E" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={s.container}>
          {/* Header */}
          <View style={s.header}>
            <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
              <Ionicons name="arrow-back" size={22} color="#9CA3AF" />
            </TouchableOpacity>
            <Text style={s.titulo}>Parâmetros de Glicemia</Text>
            <View style={{ width: 30 }} />
          </View>

          <View style={s.form}>
            <Text style={s.descricao}>
              Defina as faixas (mg/dL) que o app usará para classificar seus
              registros como Baixo, Normal ou Alto.
            </Text>

            {/* Glicemia Baixa */}
            <Text style={s.label}>Glicemia Baixa (Limite Mínimo)</Text>
            <View style={s.inputRow}>
              <Ionicons name="alert-circle-outline" size={20} color="#38BDF8" style={s.icon} />
              <TextInput
                style={s.inputText}
                keyboardType="numeric"
                value={String(metas.targetMin)}
                onChangeText={(t) => setMetaValor("targetMin", t)}
                placeholder="Ex: 70"
                placeholderTextColor="#9CA3AF"
                returnKeyType="next"
              />
            </View>

            {/* Glicemia Alta */}
            <Text style={s.label}>Glicemia Alta (Limite Máximo)</Text>
            <View style={s.inputRow}>
              <Ionicons name="warning-outline" size={20} color="#F87171" style={s.icon} />
              <TextInput
                style={s.inputText}
                keyboardType="numeric"
                value={String(metas.targetMax)}
                onChangeText={(t) => setMetaValor("targetMax", t)}
                placeholder="Ex: 180"
                placeholderTextColor="#9CA3AF"
                returnKeyType="next"
              />
            </View>

            {/* Hipoglicemia de Urgência */}
            <Text style={s.label}>Hipoglicemia de Urgência</Text>
            <View style={s.inputRow}>
              <Ionicons name="flash-outline" size={20} color="#F43F5E" style={s.icon} />
              <TextInput
                style={s.inputText}
                keyboardType="numeric"
                value={String(metas.dangerLow)}
                onChangeText={(t) => setMetaValor("dangerLow", t)}
                placeholder="Ex: 55"
                placeholderTextColor="#9CA3AF"
                returnKeyType="done"
                onSubmitEditing={saveMetas}
              />
            </View>

            {/* Botão Salvar */}
            <TouchableOpacity
              onPress={saveMetas}
              disabled={saving}
              style={[s.btn, saving && { opacity: 0.6 }]}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#052e12" />
              ) : (
                <Text style={s.btnText}>Salvar Parâmetros</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A" },
  form: { padding: 16 },
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
  descricao: {
    color: "#9CA3AF",
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },
  label: {
    color: "#E5E7EB",
    marginBottom: 8,
    marginLeft: 6,
    fontWeight: "bold",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111827",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44, // Um pouco mais alto para inputs
    borderWidth: 1,
    borderColor: "#1f2937",
    marginBottom: 16,
  },
  icon: {
    marginRight: 8,
  },
  inputText: {
    flex: 1,
    color: "#E5E7EB",
    fontSize: 16, // Maior para números
  },
  btn: {
    backgroundColor: "#22C55E",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 24,
  },
  btnText: {
    color: "#052e12",
    fontWeight: "800",
  },
});