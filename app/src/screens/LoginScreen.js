import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { firebase } from "../../../firebase/config";

export default class LoginScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
      loading: false,
      showPassword: false,
    };
  }

  // Login
  ler = async () => {
    const email = (this.state.email || "").trim();
    const password = (this.state.password || "").trim();

    if (!email || !password) {
      Alert.alert("Erro", "Preencha todos os campos");
      return;
    }

    this.setState({ loading: true });
    try {
      await firebase.auth().signInWithEmailAndPassword(email, password);
      Alert.alert("Sucesso", "Login efetuado com sucesso");
      router.replace("/src/(tabs)/home");
    } catch (error) {
      const code = error?.code || "";
      if (code === "auth/invalid-email") {
        Alert.alert("Formato do e-mail inválido");
      } else if (
        code === "auth/user-not-found" ||
        code === "auth/wrong-password" ||
        code === "auth/invalid-credential"
      ) {
        Alert.alert("Credenciais inválidas", "Confira e tente novamente.");
      } else if (code === "auth/network-request-failed") {
        Alert.alert("Erro de rede", "Verifique sua conexão.");
      } else {
        Alert.alert("Ocorreu um erro", code || "desconhecido");
      }
    } finally {
      this.setState({ loading: false });
    }
  };

  recoverPassword = async () => {
    const email = (this.state.email || "").trim();
    if (!email) {
      Alert.alert(
        "Informe seu e-mail",
        "Digite seu e-mail para recuperar a senha."
      );
      return;
    }
    try {
      await firebase.auth().sendPasswordResetEmail(email);
      Alert.alert(
        "E-mail enviado",
        "Confira seu e-mail para recuperar a senha."
      );
    } catch (e) {
      const code = e?.code || "";
      if (code === "auth/invalid-email") {
        Alert.alert("E-mail inválido", "Confira o endereço digitado.");
      } else if (code === "auth/user-not-found") {
        Alert.alert("Usuário não encontrado", "Verifique o e-mail informado.");
      } else {
        Alert.alert("Erro", code || "Falha ao enviar e-mail.");
      }
    }
  };

  render() {
    const { email, password, loading } = this.state;
    const canSubmit = !!email && !!password;

    return (
      <View style={s.container}>
        <View style={s.brandRow}>
          <Image
            source={require("../assets/images/nivelo_logo.png")}
            style={s.brandLogo}
          />
          <Image
            source={require("../assets/images/nivelo_name.png")}
            style={s.brandName}
          />
        </View>

        <Text style={s.title}>Login</Text>

        {/* E-MAIL */}
        <Text style={s.label}>E-mail:</Text>
        <View style={s.inputRow}>
          <Ionicons
            name="mail-outline"
            size={20}
            color="#9CA3AF"
            style={s.icon}
          />
          <TextInput
            style={s.inputText}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={(t) => this.setState({ email: t })}
            placeholder="voce@email.com"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* SENHA */}
        <Text style={s.label}>Senha:</Text>
        <View style={s.inputRow}>
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color="#9CA3AF"
            style={s.icon}
          />
          <TextInput
            style={s.inputText}
            secureTextEntry={!this.state.showPassword}
            value={password}
            onChangeText={(t) => this.setState({ password: t })}
            placeholder="senha"
            placeholderTextColor="#9CA3AF"
          />
          <TouchableOpacity
            onPress={() =>
              this.setState({ showPassword: !this.state.showPassword })
            }
          >
            <Ionicons
              name={this.state.showPassword ? "eye-outline" : "eye-off-outline"}
              size={20}
              color="#9CA3AF"
            />
          </TouchableOpacity>
        </View>

        <View style={s.separator}>
          <Text style={s.recover} onPress={this.recoverPassword}>
            Recuperar Senha
          </Text>

          {/* Cadastro */}
          <Text style={s.register} onPress={() => router.push("/register")}>
            Criar Conta
          </Text>
        </View>

        <TouchableOpacity
          style={[s.btn, (!canSubmit || loading) && { opacity: 0.6 }]}
          onPress={this.ler}
          disabled={!canSubmit || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#E5E7EB" />
          ) : (
            <Text style={s.btnText}>Entrar</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#0F172A",
    justifyContent: "center",
  },
  title: {
    color: "#E5E7EB",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  label: {
    color: "#E5E7EB",
    marginTop: 8,
    marginBottom: 6,
    left: 6,
    fontWeight: "bold",
  },
  input: {
    backgroundColor: "#111827",
    color: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
  },
  btn: {
    backgroundColor: "#22C55E",
    padding: 14,
    borderRadius: 12,
    marginTop: 16,
    alignItems: "center",
  },
  btnText: {
    color: "#052e12",
    fontWeight: "800",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    marginTop: -30,
  },
  brandLogo: {
    width: 90,
    height: 90,
    resizeMode: "contain",
  },
  brandName: {
    width: 120,
    height: 120,
    resizeMode: "contain",
  },
  separator: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 12,
  },
  recover: {
    color: "#E5E7EB",
    marginTop: 8,
    marginBottom: 6,
    left: 6,
    fontWeight: "bold",
  },
  register: {
    color: "#E5E7EB",
    marginTop: 8,
    marginBottom: 6,
    right: 6,
    fontWeight: "bold",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111827",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
  },
  icon: {
    marginRight: 8,
  },
  inputText: {
    flex: 1,
    color: "#E5E7EB",
  },
});
