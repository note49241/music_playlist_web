"use client";
import dayjs from "dayjs";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Table, Button } from "reactstrap";
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
  const playlistId = router.playlistsid;

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
    </div>
  );
}
