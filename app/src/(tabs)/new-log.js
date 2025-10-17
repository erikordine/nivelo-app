import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import firebase from "firebase/compat/app";
import { useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function NewLog() {
  const [glicose, setGlicose] = useState("");
  const [context, setContext] = useState("random");
  const [carboidrato, setCarboidrato] = useState("");
  const [insulina, setInsulina] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  // Utilizado para nao ficar repetindo this.
  const save = async () => {
    // Verificação
    const g = Number(glicose);
    if (!g || isNaN(g))
      return Alert.alert("Atenção", "Informe um valor válido de glicemia.");
    if (g < 20 || g > 900)
      return Alert.alert(
        "Atenção",
        "Informe um valor de glicemia entre 20 e 900."
      );

    // Pega o id do usuario
    const uid = firebase.auth().currentUser.uid;
    if (!uid)
      return Alert.alert("Atencao", "Nao foi possivel identificar o usuario.");

    setLoading(true);
    try {
      // Escreve dentro de /users/{uid}/logs o registro
      await firebase
        .firestore()
        .collection("users")
        .doc(uid)
        .collection("logs")
        .add({
          glicose: g,
          context,
          carboidrato: carboidrato ? Number(carboidrato) : null,
          insulina: insulina ? Number(insulina) : null,
          note: note?.trim() || null,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(), // Pega o timestamp do servidor
        });

      Alert.alert("Sucesso", "Registro salvo!");
      router.back();
    } catch (e) {
      Alert.alert("Erro", e?.message || "Nao foi possivel salvar o registro.");
    } finally {
      setLoading(false);
    }
  };

  const Chip = ({ value, label }) => (
    <TouchableOpacity
      onPress={() => setContext(value)}
      style={[
        s.chip,
        context === value && {
          borderColor: "#22C55E",
          backgroundColor: "#0b2b1a",
        },
      ]}
    >
      <Text style={{ color: context === value ? "#E5E7EB" : "#9CA3AF" }}>
        {label}
      </Text>
    </TouchableOpacity>
  );

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

      {/* Formulario */}
      <Text style={s.title}>Novo Registro</Text>

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
          keybordType="numeric"
          value={glicose}
          onChangeText={setGlicose}
          placeholder="Glicose"
          placeholderTextColor="#9CA3AF"
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
          value={carboidrato}
          onChangeText={setCarboidrato}
          placeholder="ex.: 45"
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <Text style={[s.label, { marginTop: 12 }]}>Insulina (U) — opcional</Text>
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
          value={insulina}
          onChangeText={setInsulina}
          placeholder="ex.: 4"
          placeholderTextColor="#9CA3AF"
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
          style={{ marginRight: 8 }}
        />
        <TextInput
          style={[s.inputText, { height: "100%" }]}
          value={note}
          onChangeText={setNote}
          placeholder="Ex.: após almoço"
          placeholderTextColor="#9CA3AF"
          multiline
        />
      </View>

      <TouchableOpacity
        onPress={save}
        disabled={loading}
        style={[s.btn, loading && { opacity: 0.6 }]}
      >
        <Text style={s.btnText}>
          {loading ? "Salvando…" : "Salvar registro"}
        </Text>
      </TouchableOpacity>
    </View>
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
