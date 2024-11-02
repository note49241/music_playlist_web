"use client";
import dayjs from "dayjs";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Input,
  ListGroup,
  ListGroupItem,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";
import { FaPlay } from "react-icons/fa";
import { BsFillTrashFill } from "react-icons/bs";
import "bootstrap/dist/css/bootstrap.min.css";

interface Song {
  id: string;
  img: string;
  title: string;
  artist: { id: string; name: string };
  album: { id: string; title: string; cover_medium: string };
  steam: string;
  create_dt: Date;
}

interface Playlist {
  _id: string;
  name: string;
  songs: Song[];
}

export default function PlaylistPage() {
  const router = useParams(); // UseParams directly
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [songs, setSongs] = useState<Song[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(
    null
  );
  const [query, setQuery] = useState("");
  const [isModalGetSongOpen, setIsModalGetSongOpen] = useState<boolean>(false);
  const playlistId = router.playlistsid;

  const toggleModal = () => setIsModalGetSongOpen(!isModalGetSongOpen);

  const fetchPlaylist = async () => {
    console.log(playlistId);
    try {
      const response = await fetch(
        `http://localhost:3001/playlists/${playlistId}`
      );
      const data = await response.json();
      console.log("playlist", data);
      setPlaylist(data);
    } catch (error) {
      console.error("Error fetching playlist:", error);
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
  const addToPlaylist = async (song: Song) => {
    if (selectedPlaylist) {
      const updatedPlaylist = {
        id: song.id,
        title: song.title,
        img: song.album.cover_medium,
        artist: {
          id: song.artist.id,
          name: song.artist.name,
        },
        album: {
          id: song.album.id,
          title: song.album.title,
        },
        steam: song.link,
        create_dt: new Date(),
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
        fetchPlaylist();
        toggleModal(); // Close the modal after adding
      } catch (error) {
        console.error("Error updating playlist:", error);
      }
    }
  };

  const removeFromPlaylist = async (songId: string) => {
    try {
      await fetch(`http://localhost:3001/playlists/${playlistId}/remove-song`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ songId }),
      });
      fetchPlaylist(); // Refresh after removal
    } catch (error) {
      console.error("Error removing song:", error);
    }
  };

  const handleStreamClick = (streamUrl: string) => {
    window.open(streamUrl, "_blank");
  };

  useEffect(() => {
    if (playlistId) fetchPlaylist();
  }, [playlistId]);

  if (loading) return <p>Loading...</p>;
  if (!playlist) return <p>Playlist not found.</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>{playlist.name}</h1>
      <Button
        onClick={() => {
          setSelectedPlaylist(playlist);
          toggleModal();
        }}
        color="info"
      >
        Search Songs
      </Button>
      <Table striped responsive>
        <thead>
          <tr>
            <th>Cover</th>
            <th>Title</th>
            <th>Artist</th>
            <th>Album</th>
            <th>Add Date</th>
            <th>Link</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {playlist.songs.map((song) => (
            <tr key={song.id}>
              <td>
                <img
                  src={song.img || "/default-image.png"}
                  alt="Album cover"
                  width="50"
                  height="50"
                  style={{ objectFit: "cover" }}
                />
              </td>
              <td>{song.title}</td>
              <td>{song.artist?.name || "Unknown Artist"}</td>
              <td>{song.album?.title || "Unknown Album"}</td>
              <td>{dayjs(song.create_dt).format("DD/MM/YYYY")}</td>
              <td>
                <Button
                  color="primary"
                  onClick={() => handleStreamClick(song.steam)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FaPlay size={16} />
                </Button>
              </td>
              <td>
                <Button
                  color="danger"
                  onClick={() => removeFromPlaylist(song.id)}
                >
                  <BsFillTrashFill size={16} />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
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
    </div>
  );
}
