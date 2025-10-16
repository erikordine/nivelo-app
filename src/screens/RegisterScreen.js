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
import { firebase } from "../firebase/config";

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

        <Text style={s.label}>E-mail:</Text>
        <TextInput
          style={s.input}
          autoCapitalize="none" // Evita que a primeira letra fique maiúscula
          keyboardAppearance="email-address"
          value={email}
          onChangeText={(t) => this.setState({ email: t })}
          placeholder="voce@email.com"
          placeholderTextColor="#9Ca3AF"
        />

        <Text style={s.label}>Senha:</Text>
        <TextInput
          style={s.input}
          secureTextEntry={true}
          value={password}
          onChangeText={(t) => this.setState({ password: t })}
          placeholder="senha"
          placeholderTextColor="#9Ca3AF"
        />

        <Text style={s.label}>Confirmar Senha:</Text>
        <TextInput
          style={s.input}
          secureTextEntry={true}
          value={confirmPassword}
          onChangeText={(t) => this.setState({ confirmPassword: t })}
          placeholder="confirmar senha"
          placeholderTextColor="#9Ca3AF"
        />

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
    marginTop: 8,
    marginBottom: 6,
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
});
