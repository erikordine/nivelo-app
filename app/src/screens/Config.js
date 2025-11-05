// src/screens/Config.jsx
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, rtdb, firebase } from "../../../firebase/config";

export default function ConfigScreen() {
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [processando, setProcessando] = useState(false); // para reset/excluir

  // perfil / preferências
  const [email, setEmail] = useState("");
  const [nome, setNome] = useState("");
  const [unidade, setUnidade] = useState("mg/dL"); // "mg/dL" | "mmol/L"
  const [metaMin, setMetaMin] = useState("70");
  const [metaMax, setMetaMax] = useState("180");
  const [notificacoes, setNotificacoes] = useState(true);

  const minRef = useRef(null);
  const maxRef = useRef(null);

  // carrega configs do usuário
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      setCarregando(true);
      if (!user) {
        setEmail("");
        setNome("");
        setCarregando(false);
        return;
      }
      setEmail(user.email || "");
      setNome(user.displayName || "");

      try {
        const snap = await rtdb.ref(`users/${user.uid}/settings`).get();
        const cfg = snap.val() || {};
        if (cfg.unidade) setUnidade(cfg.unidade);
        if (cfg.metaMin != null) setMetaMin(String(cfg.metaMin));
        if (cfg.metaMax != null) setMetaMax(String(cfg.metaMax));
        if (cfg.notificacoes != null) setNotificacoes(!!cfg.notificacoes);
      } catch (e) {
        console.warn("Falha ao carregar settings:", e?.message);
      } finally {
        setCarregando(false);
      }
    });
    return () => unsub();
  }, []);

  const salvar = async () => {
    if (salvando) return;

    // validações simples
    const nMin = Number(String(metaMin).replace(",", "."));
    const nMax = Number(String(metaMax).replace(",", "."));
    if (isNaN(nMin) || isNaN(nMax)) {
      Alert.alert("Atenção", "Metas devem ser números.");
      return;
    }
    if (nMin >= nMax) {
      Alert.alert("Atenção", "Meta mínima deve ser menor que a máxima.");
      return;
    }

    setSalvando(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Sessão", "Usuário não autenticado.");
        return;
      }

      await rtdb.ref(`users/${user.uid}/settings`).update({
        unidade,
        metaMin: nMin,
        metaMax: nMax,
        notificacoes,
        updatedAt: firebase.database.ServerValue.TIMESTAMP,
      });

      // atualiza displayName do auth (opcional)
      if ((user.displayName || "") !== (nome || "")) {
        await user.updateProfile({ displayName: nome || null });
      }

      Alert.alert("Pronto", "Configurações salvas!");
    } catch (e) {
      Alert.alert("Erro", e?.message || "Falha ao salvar configurações.");
    } finally {
      setSalvando(false);
    }
  };

  // ======== NOVO: Redefinir senha (envia e-mail) ========
  const enviarRedefinicaoSenha = async () => {
    if (processando) return;
    const user = auth.currentUser;
    const mail = user?.email || email;
    if (!mail) {
      Alert.alert("Atenção", "Não há e-mail para enviar o link.");
      return;
    }
    setProcessando(true);
    try {
      await auth.sendPasswordResetEmail(mail);
      Alert.alert(
        "Verifique seu e-mail",
        `Enviamos um link de redefinição para: ${mail}`
      );
    } catch (e) {
      const code = e?.code || "";
      if (code === "auth/invalid-email") {
        Alert.alert("E-mail inválido", "O e-mail da conta é inválido.");
      } else if (code === "auth/user-not-found") {
        Alert.alert("Usuário não encontrado", "Conta não localizada.");
      } else {
        Alert.alert("Erro", e?.message || "Falha ao enviar o e-mail.");
      }
    } finally {
      setProcessando(false);
    }
  };

  // ======== NOVO: Excluir conta ========
  const excluirConta = () => {
    Alert.alert(
      "Excluir conta",
      "Isso apagará sua conta e seus dados (registros e configurações). Deseja continuar?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            if (processando) return;
            setProcessando(true);
            try {
              const user = auth.currentUser;
              if (!user) {
                Alert.alert("Sessão", "Usuário não autenticado.");
                setProcessando(false);
                return;
              }
              const uid = user.uid;

              // 1) apaga os dados no RTDB (ajuste se você tiver outros nós)
              await rtdb.ref(`users/${uid}`).remove();

              // 2) deleta a conta do Auth
              await user.delete();

              Alert.alert("Conta excluída", "Sua conta foi removida com sucesso.");
              router.replace("/src/screens/LoginScreen"); // ajuste o caminho da sua tela de login
            } catch (e) {
              // Caso o Firebase exija reautenticação
              if ((e?.code || "") === "auth/requires-recent-login") {
                Alert.alert(
                  "Reautenticação necessária",
                  "Por segurança, faça login novamente e tente excluir a conta de novo."
                );
              } else {
                Alert.alert("Erro", e?.message || "Falha ao excluir a conta.");
              }
            } finally {
              setProcessando(false);
            }
          },
        },
      ]
    );
  };

  // ======== NOVO: Sair ========
  const sair = async () => {
    if (processando) return;
    setProcessando(true);
    try {
      await auth.signOut();
      router.replace("./LoginScreen"); // ajuste o caminho da sua tela de login
    } catch (e) {
      Alert.alert("Erro", e?.message || "Falha ao sair.");
    } finally {
      setProcessando(false);
    }
  };

  const Chip = ({ value, label }) => (
    <TouchableOpacity
      onPress={() => setUnidade(value)}
      style={[
        s.chip,
        unidade === value && {
          borderColor: "#22C55E",
          backgroundColor: "#0b2b1a",
        },
      ]}
      accessibilityRole="radio"
      accessibilityState={{ selected: unidade === value }}
    >
      <Text style={{ color: unidade === value ? "#E5E7EB" : "#9CA3AF" }}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#0F172A" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.select({ ios: 64, android: 0 })}
    >
      <ScrollView
        style={{ flex: 1, backgroundColor: "#0F172A" }}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={s.container}>
          {/* HEADER */}
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
              onPress={() => router.back()}
              style={s.iconButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={24} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          <Text style={s.title}>Configurações</Text>

          {/* PERFIL */}
          <Text style={s.sectionTitle}>Perfil</Text>

          <Text style={s.label}>E-mail</Text>
          <View style={[s.inputRow, { opacity: 0.7 }]}>
            <Ionicons name="mail-outline" size={20} color="#9CA3AF" style={s.icon} />
            <TextInput
              style={s.inputText}
              editable={false}
              value={email}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <Text style={s.label}>Nome de exibição</Text>
          <View style={s.inputRow}>
            <Ionicons name="person-outline" size={20} color="#9CA3AF" style={s.icon} />
            <TextInput
              style={s.inputText}
              value={nome}
              onChangeText={setNome}
              placeholder="Seu nome"
              placeholderTextColor="#9CA3AF"
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => minRef.current?.focus()}
            />
          </View>

          {/* PREFERÊNCIAS */}
          <Text style={s.sectionTitle}>Preferências</Text>

          <Text style={s.label}>Unidade</Text>
          <View style={s.chipsRow}>
            <Chip value="mg/dL" label="mg/dL" />
            <Chip value="mmol/L" label="mmol/L" />
          </View>

          {/* METAS */}
          <Text style={s.sectionTitle}>Metas</Text>

          <Text style={s.label}>Faixa alvo (mín / máx)</Text>
          <View style={[s.inputRow, { gap: 8 }]}>
            <Ionicons name="flag-outline" size={20} color="#9CA3AF" style={s.icon} />
            <TextInput
              ref={minRef}
              style={[s.inputText, { flex: 1 }]}
              keyboardType="numeric"
              value={metaMin}
              onChangeText={setMetaMin}
              placeholder="ex.: 70"
              placeholderTextColor="#9CA3AF"
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => maxRef.current?.focus()}
            />
            <TextInput
              ref={maxRef}
              style={[s.inputText, { flex: 1 }]}
              keyboardType="numeric"
              value={metaMax}
              onChangeText={setMetaMax}
              placeholder="ex.: 180"
              placeholderTextColor="#9CA3AF"
              returnKeyType="done"
              blurOnSubmit
            />
          </View>

          {/* NOTIFICAÇÕES */}
          <Text style={s.sectionTitle}>Notificações</Text>

          <View style={s.rowBetween}>
            <Text style={s.text}>Receber notificações</Text>
            <Switch
              value={notificacoes}
              // mudar tamanho do switch
              style={{ top: 8 }}
              onValueChange={setNotificacoes}
              thumbColor={notificacoes ? "#22C55E" : "#9CA3AF"}
              trackColor={{ false: "#334155", true: "#14532d" }}
            />
          </View>

          {/* AÇÕES */}
          <View style={{ height: 20 }} />

          <TouchableOpacity
            onPress={salvar}
            disabled={carregando || salvando}
            style={[s.btn, (carregando || salvando) && { opacity: 0.6 }]}
          >
            <Text style={s.btnText}>{salvando ? "Salvando…" : "Salvar"}</Text>
          </TouchableOpacity>

          {/* ======== NOVO: Redefinir senha ======== */}
          <TouchableOpacity
            onPress={enviarRedefinicaoSenha}
            disabled={processando}
            style={[s.btnOutline, { marginTop: 12 }, processando && { opacity: 0.6 }]}
          >
            <Text style={s.btnOutlineText}>Enviar e-mail de redefinição de senha</Text>
          </TouchableOpacity>

          {/* ======== NOVO: Excluir conta ======== */}
          <TouchableOpacity
            onPress={excluirConta}
            disabled={processando}
            style={[s.btnDanger, { marginTop: 10 }, processando && { opacity: 0.6 }]}
          >
            <Text style={s.btnDangerText}>Excluir minha conta</Text>
          </TouchableOpacity>

          {/* ======== NOVO: Sair ======== */}
          <TouchableOpacity
            onPress={sair}
            disabled={processando}
            style={[s.btnDanger, { marginTop: 10 }, processando && { opacity: 0.6 }]}
          >
            <Text style={s.btnDangerText}>Sair</Text>
          </TouchableOpacity>

          <View style={{ height: 28 }} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A", padding: 16 },

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
  brandLeft: { flexDirection: "row", alignItems: "center" },
  brandLogo: { width: 70, height: 70, resizeMode: "contain", top: 8 },
  brandName: { width: 80, height: 80, resizeMode: "contain", top: 10 },
  iconButton: { padding: 8, borderRadius: 999, top: 5, right: 6 },

  title: { color: "#E5E7EB", fontSize: 22, fontWeight: "800", marginBottom: 8 },
  sectionTitle: {
    color: "#E5E7EB",
    fontSize: 16,
    fontWeight: "800",
    marginTop: 18,
    marginBottom: 8,
  },
  label: { color: "#E5E7EB", marginBottom: 8, marginLeft: 6, fontWeight: "bold" },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111827",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: "#1f2937",
    marginBottom: 12,
  },
  inputText: { flex: 1, color: "#E5E7EB" },
  icon: { marginRight: 8 },

  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  chip: {
    borderWidth: 1,
    borderColor: "#334155",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    marginRight: 8,
    marginBottom: 8,
  },

  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#111827",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1f2937",
    paddingHorizontal: 12,
    height: 48,
  },
  text: { color: "#E5E7EB" },

  btn: {
    backgroundColor: "#22C55E",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  btnText: { color: "#052e12", fontWeight: "800" },

  btnOutline: {
    borderWidth: 1,
    borderColor: "#334155",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  btnOutlineText: { color: "#E5E7EB", fontWeight: "700", textAlign: "center" },

  btnDanger: {
    backgroundColor: "#7f1d1d",
    borderColor: "#b91c1c",
    borderWidth: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  btnDangerText: { color: "#FEE2E2", fontWeight: "800" },
});
