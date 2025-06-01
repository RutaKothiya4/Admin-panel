import React, { useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Spinner,
} from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  updateProfilePhotoThunk,
  deleteProfilePhotoThunk,
} from "../features/auth/authThunks";

export default function ProfilePhotoModal({ isOpen, toggle }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const [messageModal, setMessageModal] = useState({
    show: false,
    message: "",
    isError: false,
  });

  const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);

  const onFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessageModal({ show: true, message: "Please select a file first!", isError: true });
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("profilePhoto", selectedFile);
    try {
      await dispatch(updateProfilePhotoThunk(formData)).unwrap();
      setMessageModal({ show: true, message: "Profile photo updated successfully!", isError: false });
    } catch (error) {
      setMessageModal({ show: true, message: "Failed to update profile photo: " + error, isError: true });
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = () => {
    setConfirmDeleteModal(true);
  };

  const handleDeleteConfirmed = async () => {
    setLoading(true);
    setConfirmDeleteModal(false);
    try {
      await dispatch(deleteProfilePhotoThunk()).unwrap();
      setMessageModal({ show: true, message: "Profile photo deleted successfully!", isError: false });
    } catch (error) {
      setMessageModal({ show: true, message: "Failed to delete profile photo: " + error, isError: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Main Profile Modal */}
      <Modal isOpen={isOpen} toggle={toggle}>
        <ModalHeader toggle={toggle}>Update Profile Photo</ModalHeader>
        <ModalBody>
          <Input type="file" accept="image/*" onChange={onFileChange} />
          {loading && <Spinner size="sm" color="primary" className="mt-2" />}
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleUpload} disabled={loading}>
            Upload
          </Button>
          {user?.profilePhoto && (
            <Button color="danger" onClick={confirmDelete} disabled={loading}>
              Delete Photo
            </Button>
          )}
          <Button color="secondary" onClick={toggle} disabled={loading}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      {/* Message Modal */}
      <Modal isOpen={messageModal.show} toggle={() => setMessageModal({ ...messageModal, show: false })}>
        <ModalHeader
          toggle={() => setMessageModal({ ...messageModal, show: false })}
          className={messageModal.isError ? "bg-danger text-white" : "bg-success text-white"}
        >
          {messageModal.isError ? "Error" : "Success"}
        </ModalHeader>
        <ModalBody>{messageModal.message}</ModalBody>
        <ModalFooter>
          <Button
            color={messageModal.isError ? "danger" : "success"}
            onClick={() => {
              setMessageModal({ ...messageModal, show: false });
              if (!messageModal.isError) toggle(); // close parent modal if successful
            }}
          >
            OK
          </Button>
        </ModalFooter>
      </Modal>

      {/* Confirm Delete Modal */}
      <Modal isOpen={confirmDeleteModal} toggle={() => setConfirmDeleteModal(false)}>
        <ModalHeader toggle={() => setConfirmDeleteModal(false)}>
          Confirm Delete
        </ModalHeader>
        <ModalBody>Are you sure you want to delete your profile photo?</ModalBody>
        <ModalFooter>
          <Button color="danger" onClick={handleDeleteConfirmed}>
            Yes, Delete
          </Button>
          <Button color="secondary" onClick={() => setConfirmDeleteModal(false)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
