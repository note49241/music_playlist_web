"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  ListGroup,
  ListGroupItem,
  Table,
  ButtonGroup,
} from "reactstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { BsMusicNoteList } from "react-icons/bs";

interface Song {
  id: string;
  img: string;
  title: string;
  artist: { id: string; name: string };
  album: { id: string; title: string; cover_medium: string };
  steam: string;
  create_dt: Date;
  link: string;
}

interface Playlist {
  _id: string;
  name: string;
  songs: Song[];
}

export default function Home() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [isModalAddPlaylistOpen, setIsModalAddPlaylistOpen] =
    useState<boolean>(false);
  const [addPlaylistName, setAddPlaylistName] = useState("");

  const toggleAddPlaylistModal = () =>
    setIsModalAddPlaylistOpen(!isModalAddPlaylistOpen);

  const fetchPlaylists = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3001/playlists");
      const data = await response.json();
      // Assuming data is already in the desired format
      console.log(data);
      setPlaylists(data);
    } catch (error) {
      console.error("Error fetching playlists:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlaylist = async () => {
    if (!addPlaylistName) return;
    const newPlaylist = { name: addPlaylistName, songs: [] };

    try {
      const response = await fetch("http://localhost:3001/playlists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPlaylist),
      });

      if (!response.ok) throw new Error("Network response was not ok");

      const data = await response.json();
      console.log("Playlist added:", data);
    } catch (error) {
      console.error("Error adding playlist:", error);
    } finally {
      setAddPlaylistName("");
      toggleAddPlaylistModal();
      fetchPlaylists();
    }
  };

  const deletePlaylist = async (playlistId: string) => {
    if (!confirm("Are you sure you want to delete this playlist?")) return;

    try {
      await fetch(`http://localhost:3001/playlists/${playlistId}`, {
        method: "DELETE",
      });
      fetchPlaylists();
    } catch (error) {
      console.error("Error remove playlist:", error);
    } finally {
      fetchPlaylists();
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <div style={{ padding: "20px" }}>
        <h1 style={{ textAlign: "center" }}>
          Music Playlists <BsMusicNoteList />
        </h1>
        <Button
          color="primary"
          className="mb-3"
          onClick={() => setIsModalAddPlaylistOpen(true)}
        >
          Add Playlist
        </Button>
        {playlists.length === 0 ? (
          <p>No playlists found.</p>
        ) : (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th style={{ textAlign: "center", verticalAlign: "middle" }}>
                  #
                </th>
                <th
                  style={{
                    textAlign: "center",
                    verticalAlign: "middle",
                    width: "750px",
                  }}
                >
                  Name
                </th>
                <th style={{ textAlign: "center", verticalAlign: "middle" }}>
                  Songs
                </th>
                <th
                  style={{
                    textAlign: "center",
                    verticalAlign: "middle",
                    width: "300px",
                  }}
                >
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {playlists.map((playlist, index) => (
                <tr key={playlist._id}>
                  <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                    {index + 1}
                  </td>
                  <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                    {playlist.name}
                  </td>
                  <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                    {playlist.songs.length}
                  </td>
                  <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                    <ButtonGroup>
                      <Link href={`/playlists/${playlist._id}`} passHref>
                        <Button color="info">Go to Playlist</Button>
                      </Link>
                      <Button
                        color="danger"
                        onClick={() => {
                          deletePlaylist(playlist._id);
                        }}
                      >
                        delete
                      </Button>
                    </ButtonGroup>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>

      <Modal isOpen={isModalAddPlaylistOpen} toggle={toggleAddPlaylistModal}>
        <ModalHeader toggle={toggleAddPlaylistModal}>Add Playlist</ModalHeader>
        <ModalBody>
          <Input
            type="text"
            placeholder="Enter playlist name"
            value={addPlaylistName}
            onChange={(e) => setAddPlaylistName(e.target.value)}
          />
          <Button color="success" className="mt-2" onClick={handleAddPlaylist}>
            Add Playlist
          </Button>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggleAddPlaylistModal}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
