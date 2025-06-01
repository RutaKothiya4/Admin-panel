import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Alert,
} from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { registerThunk } from "../features/auth/authThunks";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";

export default function RegisterPage() {
  // Form state: username, password, role
  const [form, setForm] = useState({
    username: "",
    password: "",
    role: "User",
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);

  // Handle input changes for form fields
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("username", form.username);
    formData.append("password", form.password);
    formData.append("role", form.role);
    if (form.profilePhoto) {
      formData.append("profilePhoto", form.profilePhoto);
    }
    const res = await dispatch(registerThunk(formData));
    if (res.type.endsWith("fulfilled")) {
      navigate("/login");
    }
  };

  const handleFileChange = (e) => {
    setForm({ ...form, profilePhoto: e.target.files[0] });
  };
  // Show loader while processing registration
  if (loading) return <Loader />;

  return (
    <Container>
      <Row className="justify-content-center">
        <Col md="6">
          <Card className="shadow-sm">
            <CardBody>
              <CardTitle tag="h2" className="mb-4 text-center">
                Register
              </CardTitle>
              {/* Display error if any */}
              {error && <Alert color="danger">{error}</Alert>}
              <Form onSubmit={onSubmit}>
                <FormGroup>
                  <Label>Username</Label>
                  <Input
                    name="username"
                    value={form.username}
                    onChange={onChange}
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Password</Label>
                  <Input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={onChange}
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Role</Label>
                  <Input
                    type="select"
                    name="role"
                    value={form.role}
                    onChange={onChange}
                  >
                    <option>User</option>
                    <option>Manager</option>
                    <option>Super Admin</option>
                  </Input>
                </FormGroup>
                <FormGroup>
                  <Label>Profile Photo</Label>
                  <Input
                    type="file"
                    name="profilePhoto"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                  />
                </FormGroup>
                <Button color="primary" className="w-100 mt-3">
                  Register
                </Button>
              </Form>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
