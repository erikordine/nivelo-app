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
import { firebase } from "../../src/firebase/config";

export default class RegisterScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: "",
      email: "",
      password: "",
      confirmPassword: "",
    };
  }

  gravar = async () => {
    const { email, password, confirmPassword } = this.state;

    // Verificação de preenchimento
    const e = (email || "").trim();
    const p = (password || "").trim();
    const cp = (confirmPassword || "").trim();

    if (!e || !p || !cp) {
      Alert.alert("Erro", "Preencha todos os campos");
      return;
    }
    if (p !== cp) {
      Alert.alert("Erro", "As senhas devem ser iguais");
      return;
    }
    if (p.length < 6) {
      Alert.alert("Erro", "A senha deve ter pelo menos 6 caracteres");
      return;
    }

    // Criação do usuario
    try {
      this.setState({ loading: true });
      await firebase.auth().createUserWithEmailAndPassword(e, p);
      Alert.alert("Sucesso", "Cadastro realizado com sucesso");
      //   this.props.navigation.navigate("Login");
    } catch (error) {
      console.log("Firebase singnup error:", error?.code, error?.message);
      const code = error?.code || "";

      const map = {
        "auth/email-already-in-use": "Este e-mail já está em uso.",
        "auth/weak-password": "Senha muito fraca (mín. 6).",
        "auth/invalid-email": "E-mail inválido.",
        "auth/operation-not-allowed":
          "Login por e-mail/senha está desabilitado no Firebase.",
        "auth/network-request-failed": "Falha de rede. Verifique sua conexão.",
        "auth/invalid-api-key":
          "API key inválida nas configurações do Firebase.",
        "auth/app-not-authorized":
          "App não autorizado para este projeto Firebase.",
      };

      Alert.alert("Erro", map[code] || "Erro desconhecido");
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const { email, password, confirmPassword, loading } = this.state;
    const canSubit = email && password && confirmPassword && !loading; // Verifica se pode enviar

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

        <Text style={s.title}>Criar Conta</Text>

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
            keyboardType="email-address" // <- vc usou keyboardAppearance por engano
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

        {/* CONFIRMAR SENHA */}
        <Text style={s.label}>Confirmar Senha:</Text>
        <View style={s.inputRow}>
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color="#9CA3AF"
            style={s.icon}
          />
          <TextInput
            style={s.inputText}
            secureTextEntry={!this.state.showConfirm}
            value={confirmPassword}
            onChangeText={(t) => this.setState({ confirmPassword: t })}
            placeholder="confirmar senha"
            placeholderTextColor="#9CA3AF"
          />
          <TouchableOpacity
            onPress={() =>
              this.setState({ showConfirm: !this.state.showConfirm })
            }
          >
            <Ionicons
              name={this.state.showPassword ? "eye-outline" : "eye-off-outline"}
              size={20}
              color="#9CA3AF"
            />
          </TouchableOpacity>
        </View>

        <Text style={s.register} onPress={() => router.push("/login")}>
          Entrar na Conta
        </Text>

        <TouchableOpacity
          style={[s.btn, !canSubit && { opacity: 0.5 }]}
          onPress={() => this.gravar()}
          disabled={!canSubit || loading}
        >
          {loading ? (
            <ActivityIndicator color="#052e12" />
          ) : (
            <Text style={s.btnText}>Registrar</Text>
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
    marginTop: 15,
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
  register: {
    color: "#E5E7EB",
    marginTop: 15,
    marginBottom: 6,
    left: 6,
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
