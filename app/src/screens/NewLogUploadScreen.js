// IMPORTAÇÕES NECESSÁRIAS
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router"; // Importado useLocalSearchParams
import { useEffect, useState } from "react"; // Importado useEffect
import {
  ActivityIndicator,
  Alert,
  Image,
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

export default function NewLogUploadScreens() {
  // 1. OBTÉM O ID DA ROTA PARA EDIÇÃO
  const { id } = useLocalSearchParams();
  const isEditing = !!id; // Deve ser sempre true nesta tela
  const [dataLoading, setDataLoading] = useState(isEditing);

  // ESTADOS DO FORMULÁRIO
  const [glicose, setGlicose] = useState("");
  const [context, setContext] = useState("random");
  const [carboidrato, setCarboidrato] = useState("");
  const [insulina, setInsulina] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false); // Estado para salvar/atualizar

  // 2. FUNÇÃO AUXILIAR
  const toNumberOrNull = (value) => {
    if (value === "" || value == null) return null;
    return Number(String(value).replace(",", "."));
  };

  // 3. CARREGA DADOS EXISTENTES PARA EDIÇÃO
  useEffect(() => {
    if (!isEditing || !auth.currentUser) {
      setDataLoading(false);
      return;
    }

    const uid = auth.currentUser.uid;
    const logRef = rtdb.ref(`users/${uid}/logs/${id}`);

    logRef
      .once("value")
      .then((snapshot) => {
        const data = snapshot.val();
        if (data) {
          setGlicose(String(data.glicose || ""));
          setContext(data.context || "random");
          setCarboidrato(String(data.carboidrato || ""));
          setInsulina(String(data.insulina || ""));
          setNote(data.note || "");
        } else {
          Alert.alert("Erro", "Registro não encontrado.");
          router.back();
        }
      })
      .catch((e) => {
        console.error("Erro ao carregar dados para edição:", e);
        Alert.alert("Erro", "Falha ao carregar registro.");
        router.back();
      })
      .finally(() => {
        setDataLoading(false);
      });
  }, [isEditing, id]);

  // 4. FUNÇÃO DE ATUALIZAR
  const save = async () => {
    // Verificação inicial
    if (loading || dataLoading) return;

    const g = Number(glicose);
    if (!g || isNaN(g) || g < 20 || g > 900)
      return Alert.alert("Atenção", "Glicemia inválida (20-900).");

    setLoading(true);

    try {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        Alert.alert("Sessão", "Usuário não autenticado.");
        return;
      }

      // Dados para atualização
      const data = {
        glicose: g,
        context,
        carboidrato: toNumberOrNull(carboidrato),
        insulina: toNumberOrNull(insulina),
        note: note?.trim() || null,
        updatedAt: firebase.database.ServerValue.TIMESTAMP,
      };

      // MODO EDIÇÃO: Atualiza o nó existente
      const logRef = rtdb.ref(`users/${uid}/logs/${id}`);
      await logRef.update(data); // Usa update para não sobrescrever o createdAt

      Alert.alert("Sucesso", "Registro atualizado com sucesso!");
      router.back();
    } catch (e) {
      console.log("[NewLogUploadScreens] Erro ao atualizar o log:", e);
      Alert.alert(
        "Erro",
        e.message || "Não foi possível atualizar o registro."
      );
    } finally {
      setLoading(false);
    }
  };

  // Componente Chip de Contexto
  const Chip = ({ value, label }) => (
    <TouchableOpacity
      onPress={() => setContext(value)}
      style={[
        s.chip,
        // Usa ternário para corrigir erro de Text strings (retorna objeto ou null)
        context === value
          ? {
              borderColor: "#22C55E",
              backgroundColor: "#0b2b1a",
            }
          : null,
      ]}
      accessibilityRole="radio"
      accessibilityState={{ selected: context === value }}
    >
      <Text style={{ color: context === value ? "#E5E7EB" : "#9CA3AF" }}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  // Exibe o carregamento ao buscar dados para edição
  if (dataLoading) {
    return (
      <View
        style={[
          s.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#22C55E" />
        <Text style={[s.title, { marginTop: 16 }]}>Carregando Registro...</Text>
      </View>
    );
  }

  return (
    // 1. Teclado evita cobrir a View
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* 2. Toque na tela fecha o teclado */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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

          {/* Formulario */}
          <Text style={s.title}>Editar Registro</Text>

          <Text style={s.label}>Glicose:</Text>
          <View style={s.inputRow}>
            <Ionicons
              name="water-outline"
              size={20}
              color="#9CA3AF"
              style={s.icon}
            />
            <TextInput
              style={s.inputText}
              keyboardType="numeric"
              value={String(glicose)}
              onChangeText={setGlicose}
              placeholder="Glicose"
              placeholderTextColor="#9CA3AF"
              // Botão Próximo
              returnKeyType="next"
              onSubmitEditing={() => {
                /* Foco no próximo campo */
              }}
            />
          </View>

          <Text style={s.label}>Contexto</Text>
          <View style={s.chipsRow}>
            <Chip value="jejum" label="Fast" />
            <Chip value="pre" label="Pre" />
            <Chip value="pos" label="Pos" />
            <Chip value="random" label="Random" />
          </View>

          <Text style={s.label}>Carboidratos (g) *</Text>
          <View style={s.inputRow}>
            <Ionicons
              name="pizza-outline"
              size={20}
              color="#9CA3AF"
              style={{ marginRight: 8 }}
            />
            <TextInput
              style={s.inputText}
              keyboardType="numeric"
              value={String(carboidrato)}
              onChangeText={setCarboidrato}
              placeholder="ex.: 45"
              placeholderTextColor="#9CA3AF"
              returnKeyType="next"
              onSubmitEditing={() => {
                /* Foco no próximo campo */
              }}
            />
          </View>

          <Text style={[s.label, { marginTop: 12 }]}>
            Insulina (U) — opcional
          </Text>
          <View style={s.inputRow}>
            <Ionicons
              name="medkit-outline"
              size={20}
              color="#9CA3AF"
              style={{ marginRight: 8 }}
            />
            <TextInput
              style={s.inputText}
              keyboardType="numeric"
              value={String(insulina)}
              onChangeText={setInsulina}
              placeholder="ex.: 4"
              placeholderTextColor="#9CA3AF"
              returnKeyType="next"
              onSubmitEditing={() => {
                /* Foco no próximo campo */
              }}
            />
          </View>

          <Text style={[s.label, { marginTop: 12 }]}>Anotação (opcional)</Text>
          <View
            style={[
              s.inputRow,
              { height: 80, alignItems: "flex-start", paddingTop: 8 },
            ]}
          >
            <Ionicons
              name="create-outline"
              size={20}
              color="#9CA3AF"
              style={s.icon}
            />
            <TextInput
              style={[s.inputText, { height: "100%" }]}
              value={String(note)}
              onChangeText={setNote}
              placeholder="Ex.: após almoço"
              placeholderTextColor="#9CA3AF"
              multiline
              // Botão Concluído/Confirmar
              returnKeyType="done"
              onSubmitEditing={save}
            />
          </View>

          <TouchableOpacity
            onPress={save}
            disabled={loading}
            style={[s.btn, loading && { opacity: 0.6 }]}
          >
            <Text style={s.btnText}>
              {loading ? "Atualizando…" : "Atualizar Registro"}
            </Text>
          </TouchableOpacity>

          {/* Button Back */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={[s.btn, loading && { opacity: 0.6 }]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}
          >
            <Text style={s.btnText}>
              Voltar sem salvar
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
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
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
    padding: 16,
  },
  title: {
    color: "#E5E7EB",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 12,
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
    height: 40,
    borderWidth: 1,
    borderColor: "#1f2937",
    marginBottom: 12,
  },
  inputText: {
    flex: 1,
    color: "#E5E7EB",
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    borderWidth: 1,
    borderColor: "#334155",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    marginRight: 8,
    marginBottom: 8,
  },
  btn: {
    backgroundColor: "#22C55E",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
  },
  btnText: {
    color: "#052e12",
    fontWeight: "800",
  },
});
