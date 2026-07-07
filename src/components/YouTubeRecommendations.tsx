import React, { useState, useEffect } from "react";
import { Youtube, Search, CheckCircle, Clock, BookOpen, Play, Award, ExternalLink, ThumbsUp, Eye } from "lucide-react";

interface VideoResource {
  id: string; // YouTube Video ID
  title: string;
  channel: string;
  duration: string;
  category: "pacing" | "clarity" | "anxiety" | "body_language" | "structure";
  categoryLabel: string;
  description: string;
  takeaways: string[];
}

const VIDEO_RESOURCES: VideoResource[] = [
  {
    id: "eIho2S0ZahI",
    title: "How to speak so that people want to listen",
    channel: "TED / Julian Treasure",
    duration: "9:58",
    category: "clarity",
    categoryLabel: "Vocal Power & Clarity",
    description: "Renowned sound expert Julian Treasure demonstrates the seven deadly sins of speaking and provides vocal exercises, warming up tools, and speech tools (register, timbre, prosody, pace, pitch, volume) to make your words carry weight.",
    takeaways: [
      "Avoid the 7 deadly sins of speaking: Gossip, Judging, Negativity, Complaining, Excuses, Lying/Exaggerating, and Dogmatism.",
      "The 'HAIL' foundation: Honesty (be true), Authenticity (be yourself), Integrity (do what you say), and Love (wish well).",
      "Vary your vocal register (deep chest voice for authority), prosody (speaking melody), and pace (intentional pauses)."
    ]
  },
  {
    id: "Ks-_Mh1QhMc",
    title: "Your body language may shape who you are",
    channel: "TED / Amy Cuddy",
    duration: "21:02",
    category: "body_language",
    categoryLabel: "Body Language",
    description: "Social psychologist Amy Cuddy shows how 'power posing'—standing in a posture of confidence, even when we don't feel confident—can boost testosterone and lower cortisol levels, drastically reducing anxiety prior to a big speech.",
    takeaways: [
      "Nonverbal expressions govern how we think and feel about ourselves, not just how others perceive us.",
      "Two minutes of power posing (standing with hands on hips or high in the air) significantly alters body chemistry.",
      "Instead of 'fake it till you make it', practice 'fake it till you become it' to conquer performance anxiety."
    ]
  },
  {
    id: "80Syc3K_FUM",
    title: "How I Overcame My Fear of Public Speaking",
    channel: "TEDx / Danish Dhamani",
    duration: "8:35",
    category: "anxiety",
    categoryLabel: "Anxiety & Fillers",
    description: "Danish Dhamani shares his personal transformation from a terrified high school student into an award-winning speaker, outlining actionable steps to minimize verbal fillers and convert public speaking dread into confidence.",
    takeaways: [
      "Nervousness is physical energy. Don't suppress it—channel it into passion and animation.",
      "Filler words are a symptom of moving faster than your thoughts. Force yourself to pause silently.",
      "Speaking is a physical skill, just like playing an instrument or a sport. It requires deliberate practice."
    ]
  },
  {
    id: "vwp9VnFmSsc",
    title: "How to Speak Like a Leader",
    channel: "Simon Sinek",
    duration: "7:12",
    category: "structure",
    categoryLabel: "Speech Structure",
    description: "Bestselling author Simon Sinek explains how to structure your presentations around the 'Why' to inspire and engage others, and how utilizing specific speaking speeds and conversational styles builds empathy with listeners.",
    takeaways: [
      "Start with 'Why'—the core belief or purpose—before explaining 'How' and 'What' you are presenting.",
      "Deliver presentations as a service to the audience rather than a pitch for yourself.",
      "Incorporate open pauses. Pauses show the audience you are not rushing them, building mutual comfort."
    ]
  },
  {
    id: "K0pxo-dS9Hc",
    title: "The 110 Techniques of Communication & Public Speaking",
    channel: "David JP Phillips",
    duration: "16:47",
    category: "body_language",
    categoryLabel: "Body Language & Voice",
    description: "A fascinating look at the exact bodily postures, vocal micro-adjustments, hand positions, head tilts, and eye focus states that make speakers instantly look highly authoritative and likable.",
    takeaways: [
      "Incline your head slightly during key explanations to signify warmth and build audience rapport.",
      "Place your hands in an open posture with palms facing upward to denote trust, or downward for authority.",
      "Match your facial expressions to your words. Smiling slightly while delivering heavy technical data lifts audience interest."
    ]
  },
  {
    id: "S77s02-zG2w",
    title: "How to Avoid Filler Words: Um, Like, Uh, Okay",
    channel: "Practical Speaking Advice",
    duration: "5:40",
    category: "pacing",
    categoryLabel: "Pacing & Fillers",
    description: "A focused tutorial explaining why our brains default to 'uh' and 'um' during pauses, and a series of daily speaking training exercises to replace filler habits with comfortable silence.",
    takeaways: [
      "We use filler words because we are afraid of silent pauses. Learn to embrace the silence.",
      "Use the 'Breathe on Comma' rule to pacing-control your speaking rhythm.",
      "Keep sentences concise and close your mouth between statements to force a silent breath instead of an 'um'."
    ]
  }
];

export default function YouTubeRecommendations() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [watchedVideos, setWatchedVideos] = useState<string[]>([]);
  const [activeEmbedId, setActiveEmbedId] = useState<string | null>(null);

  // Load watched history
  useEffect(() => {
    const saved = localStorage.getItem("present_coach_watched_videos");
    if (saved) {
      try {
        setWatchedVideos(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const toggleWatched = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering video selection
    const updated = watchedVideos.includes(id)
      ? watchedVideos.filter((vId) => vId !== id)
      : [...watchedVideos, id];
    
    setWatchedVideos(updated);
    localStorage.setItem("present_coach_watched_videos", JSON.stringify(updated));

    // Auto-complete Daily Activity Task 4: "Watch 1 curated video tutorial in the Video Learning section"
    if (updated.length > watchedVideos.length) {
      try {
        const savedTasksStr = localStorage.getItem("present_coach_completed_tasks");
        let tasks: string[] = [];
        if (savedTasksStr) {
          tasks = JSON.parse(savedTasksStr);
        }
        if (!tasks.includes("task4")) {
          tasks.push("task4");
          localStorage.setItem("present_coach_completed_tasks", JSON.stringify(tasks));
        }
      } catch (err) {
        console.error("Failed to update daily tasks status from YouTube", err);
      }
    }
  };

  const filteredResources = VIDEO_RESOURCES.filter((res) => {
    const matchesCategory = activeCategory === "all" || res.category === activeCategory;
    const matchesSearch =
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.channel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" id="youtube-recommendations-studio">
      
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-600 mb-1">
            <Youtube className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Video Learning</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-slate-900">Curated Learning Videos</h1>
          <p className="text-slate-500 mt-1">
            Master public speaking, posture, voice dynamics, and delivery from the world's finest communication coaches.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center text-xs text-slate-500 font-semibold gap-1.5">
            <CheckCircle className="h-4 w-4 text-emerald-500" />
            <span>Completed: <strong className="text-slate-800">{watchedVideos.length}</strong> of <strong className="text-slate-800">{VIDEO_RESOURCES.length}</strong></span>
          </div>
          {watchedVideos.length === VIDEO_RESOURCES.length && (
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">Master Speaker!</span>
          )}
        </div>
      </div>

      {/* Active Video Player Widget */}
      {activeEmbedId && (
        <div className="bg-slate-900 text-white rounded-2xl overflow-hidden shadow-xl border border-slate-800 animate-fadeIn" id="youtube-player-widget">
          <div className="aspect-video w-full max-h-[500px]">
            <iframe
              src={`https://www.youtube.com/embed/${activeEmbedId}?autoplay=1`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
          <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950 border-t border-slate-800">
            <div>
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block mb-1">Currently Playing</span>
              <h3 className="font-display font-bold text-base text-white">
                {VIDEO_RESOURCES.find((v) => v.id === activeEmbedId)?.title}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Presented by {VIDEO_RESOURCES.find((v) => v.id === activeEmbedId)?.channel}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={(e) => toggleWatched(activeEmbedId, e)}
                className={`text-xs font-semibold px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
                  watchedVideos.includes(activeEmbedId)
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-200"
                }`}
              >
                <CheckCircle className="h-4 w-4" />
                <span>{watchedVideos.includes(activeEmbedId) ? "Completed!" : "Mark as Completed"}</span>
              </button>
              <button
                onClick={() => setActiveEmbedId(null)}
                className="text-xs text-slate-400 hover:text-white font-semibold hover:bg-slate-800 px-4 py-2 rounded-xl transition"
              >
                Close Player
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: "all", label: "All Topics" },
            { id: "pacing", label: "Pacing & Fillers" },
            { id: "clarity", label: "Clarity & Voice" },
            { id: "anxiety", label: "Anxiety & Confidence" },
            { id: "body_language", label: "Body Language" },
            { id: "structure", label: "Speech Structure" }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`text-xs font-semibold px-4 py-2 rounded-xl border transition ${
                activeCategory === cat.id
                  ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search learning videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 shadow-xs"
          />
        </div>
      </div>

      {/* Video Grid */}
      {filteredResources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((res) => {
            const isCompleted = watchedVideos.includes(res.id);
            const isPlaying = activeEmbedId === res.id;
            
            return (
              <div
                key={res.id}
                onClick={() => {
                  setActiveEmbedId(res.id);
                  // Scroll to player if embed started
                  document.getElementById("youtube-recommendations-studio")?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`bg-white rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden flex flex-col group relative ${
                  isPlaying 
                    ? "ring-2 ring-rose-500 border-rose-500 scale-[1.01]" 
                    : "border-slate-200 hover:border-slate-350 hover:shadow-md"
                }`}
              >
                {/* Thumbnail Header */}
                <div className="aspect-video bg-slate-100 relative overflow-hidden shrink-0">
                  <img
                    src={`https://img.youtube.com/vi/${res.id}/mqdefault.jpg`}
                    alt={res.title}
                    className="w-full h-full object-cover transition duration-350 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/35 flex items-center justify-center opacity-70 group-hover:opacity-100 transition duration-150">
                    <div className="w-12 h-12 bg-white/95 rounded-full flex items-center justify-center text-rose-600 shadow transition-all duration-150 group-hover:scale-110">
                      <Play className="h-6 w-6 fill-rose-600 ml-0.5" />
                    </div>
                  </div>

                  <span className="absolute bottom-2.5 right-2.5 bg-slate-900/80 text-[10px] text-white font-mono px-1.5 py-0.5 rounded font-bold">
                    {res.duration}
                  </span>

                  <span className="absolute top-2.5 left-2.5 bg-rose-600 text-[9px] text-white font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">
                    {res.categoryLabel}
                  </span>

                  {isCompleted && (
                    <div className="absolute top-2.5 right-2.5 bg-emerald-500 text-white p-1 rounded-full shadow-sm">
                      <CheckCircle className="h-4.5 w-4.5 fill-emerald-500 text-white" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                      {res.channel}
                    </span>
                    <h3 className="font-display font-bold text-sm text-slate-800 leading-snug group-hover:text-rose-600 transition truncate-2-lines">
                      {res.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed truncate-3-lines">
                      {res.description}
                    </p>
                  </div>

                  {/* Curated Takeaways Section */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5 text-blue-500" />
                      Key Coaching Lessons:
                    </span>
                    <ul className="space-y-1">
                      {res.takeaways.slice(0, 2).map((takeaway, tIdx) => (
                        <li key={tIdx} className="text-[11px] text-slate-600 leading-normal list-disc ml-3.5 pl-0.5">
                          {takeaway}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <button
                      onClick={(e) => toggleWatched(res.id, e)}
                      className={`font-semibold flex items-center gap-1 py-1 px-2.5 rounded-lg border transition ${
                        isCompleted
                          ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span>{isCompleted ? "Watched" : "Mark Watched"}</span>
                    </button>

                    <a
                      href={`https://www.youtube.com/watch?v=${res.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1.5 hover:underline"
                    >
                      <span>YouTube</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-sm space-y-4">
          <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mx-auto">
            <Youtube className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-display font-bold text-slate-800">No tutorials found</h3>
            <p className="text-slate-500 text-xs mt-1">
              We couldn't find any recommendations matching your search query. Try typing another term or changing the category filter.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
