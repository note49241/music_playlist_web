"use client";
import axios from "axios";
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
} from "reactstrap";
import "bootstrap/dist/css/bootstrap.min.css";

interface Song {
  id: string;
  title: string;
  artist: { id: string; name: string };
  album: { id: string; title: string };
}

interface Playlist {
  _id: string;
  name: string;
  songs: Song[];
}

export default function Home() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalGetSongOpen, setIsModalGetSongOpen] = useState<boolean>(false);
  const [query, setQuery] = useState("");
  const [songs, setSongs] = useState<Song[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(
    null
  );
  const [isModalAddPlaylistOpen, setIsModalAddPlaylistOpen] =
    useState<boolean>(false);
  const [addPlaylistName, setAddPlaylistName] = useState("");

  const toggleModal = () => setIsModalGetSongOpen(!isModalGetSongOpen);
  const toggleAddPlaylistModal = () =>
    setIsModalAddPlaylistOpen(!isModalAddPlaylistOpen);

  const fetchPlaylists = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3001/playlists");
      const data = await response.json();
      // Assuming data is already in the desired format
      setPlaylists(data);
    } catch (error) {
      console.error("Error fetching playlists:", error);
    } finally {
      setLoading(false);
    }
  };

  const searchSongs = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3001/songs/search?q=${query}`
      );
      const data = await response.json();
      if (Array.isArray(data)) {
        setSongs(data);
      } else if (data && Array.isArray(data.data)) {
        setSongs(data.data);
      } else {
        setSongs([]);
      }
    } catch (error) {
      console.error("Error fetching songs:", error);
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

  const addToPlaylist = async (song: Song) => {
    if (selectedPlaylist) {
      const updatedPlaylist = {
        id: song.id,
        title: song.title,
        artist: {
          id: song.artist.id,
          name: song.artist.name,
        },
        album: {
          id: song.album.id,
          title: song.album.title,
        },
      };

      try {
        await fetch(
          `http://localhost:3001/playlists/${selectedPlaylist._id}/add-song`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedPlaylist),
          }
        );
        fetchPlaylists();
        toggleModal(); // Close the modal after adding
      } catch (error) {
        console.error("Error updating playlist:", error);
      }
    }
  };
  const removeFromPlaylist = async (
    selectedPlaylist: string,
    songId: string
  ) => {
    console.log(selectedPlaylist, JSON.stringify({ songId }));
    if (selectedPlaylist) {
      try {
        await fetch(
          `http://localhost:3001/playlists/${selectedPlaylist}/remove-song`, // Update endpoint as necessary
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ songId }), // Sending the song ID to remove
          }
        );
        fetchPlaylists(); // Refresh the playlist after removing
      } catch (error) {
        console.error("Error removing song:", error);
      }
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <div style={{ padding: "20px" }}>
        <h1>Music Playlists 🎵</h1>
        <Button color="primary" onClick={toggleAddPlaylistModal}>
          Add Playlist
        </Button>
        {playlists.length === 0 ? (
          <p>No playlists found.</p>
        ) : (
          playlists.map((playlist) => (
            <div key={playlist._id} style={{ marginBottom: "20px" }}>
              <h2>{playlist.name}</h2>
              <Button
                onClick={() => {
                  setSelectedPlaylist(playlist);
                  toggleModal();
                }}
                color="info"
              >
                Search Songs
              </Button>

              <Table className="table-fixed" striped>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Artist</th>
                    <th>Album</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {playlist.songs.map((song) => (
                    <tr key={song.id}>
                      <td>{song.title}</td>
                      <td>{song.artist?.name || "Unknown Artist"}</td>
                      <td>{song.album?.title || "Unknown Album"}</td>
                      <td>
                        <Button
                          color="danger"
                          onClick={() =>
                            removeFromPlaylist(playlist._id, song.id)
                          }
                        >
                          Remove Song
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ))
        )}
      </div>

      <Modal isOpen={isModalGetSongOpen} toggle={toggleModal}>
        <ModalHeader toggle={toggleModal}>Search for Songs</ModalHeader>
        <ModalBody>
          <Input
            type="text"
            placeholder="Enter song or artist name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button color="success" className="mt-2" onClick={searchSongs}>
            Search
          </Button>

          <ListGroup className="mt-3">
            {songs.map((song) => (
              <ListGroupItem
                key={song.id} // Use the correct key here
                className="d-flex justify-content-between"
              >
                <div>
                  <strong>{song.title}</strong> by {song.artist.name} (Album:{" "}
                  {song.album.title})
                </div>
                <Button
                  color="info"
                  size="sm"
                  onClick={() => addToPlaylist(song)}
                >
                  Add
                </Button>
              </ListGroupItem>
            ))}
          </ListGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggleModal}>
            Close
          </Button>
        </ModalFooter>
      </Modal>

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
