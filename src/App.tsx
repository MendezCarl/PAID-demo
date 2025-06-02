import { Routes, Route, NavLink } from 'react-router-dom';
import { useState, useRef, createContext, useContext, useEffect } from 'react';
import './App.css';

// Define types for our application data
interface ProfileData {
  firstName: string;
  lastName: string;
  dob: string;
  hobbies: string;
  preexistingConditions: string;
  allergies: string;
  medication: string;
}

interface VideoSegment {
  start: number;
  end: number;
  label: string;
}

interface AppData {
  profileData: ProfileData | null;
  videoSegments: VideoSegment[];
  videoFile: File | null;
}

// Create context with default values
const AppDataContext = createContext<{
  appData: AppData;
  setAppData: React.Dispatch<React.SetStateAction<AppData>>;
}>({
  appData: {
    profileData: null,
    videoSegments: [],
    videoFile: null
  },
  setAppData: () => {}
});

// Create a provider component
function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [appData, setAppData] = useState<AppData>({
    profileData: null,
    videoSegments: [],
    videoFile: null
  });

  return (
    <AppDataContext.Provider value={{ appData, setAppData }}>
      {children}
    </AppDataContext.Provider>
  );
}

function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-left">
        <NavLink to="/" end className={({ isActive }: { isActive: boolean }) => 'nav-link' + (isActive ? ' active' : '')}>Home</NavLink>
        <NavLink to="/profile" className={({ isActive }: { isActive: boolean }) => 'nav-link' + (isActive ? ' active' : '')}>Profile</NavLink>
        <NavLink to="/upload" className={({ isActive }: { isActive: boolean }) => 'nav-link' + (isActive ? ' active' : '')}>Upload</NavLink>
        <NavLink to="/evaluate" className={({ isActive }: { isActive: boolean }) => 'nav-link' + (isActive ? ' active' : '')}>Evaluate</NavLink>
        <NavLink to="/save" className={({ isActive }: { isActive: boolean }) => 'nav-link' + (isActive ? ' active' : '')}>Save</NavLink>
      </div>
      <div className="nav-right">
        {/* Placeholder for UF logo */}
        <div className="uf-logo">UF</div>
      </div>
    </nav>
  );
}

function Home() {
  const { setAppData } = useContext(AppDataContext);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNewPatient = () => {
    // Reset the app data when starting with a new patient
    setAppData({
      profileData: null,
      videoSegments: [],
      videoFile: null
    });
  };

  const handleExistingPatientUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const csvContent = event.target?.result as string;
      const lines = csvContent.split('\n');
      
      // Skip header row and get data row
      const data = lines[1].split(',').map(field => field.replace(/^"|"$/g, '').trim());
      
      // Create profile data object
      const profileData = {
        firstName: data[0],
        lastName: data[1],
        dob: data[2],
        hobbies: data[3],
        preexistingConditions: data[4],
        allergies: data[5],
        medication: data[6]
      };

      // Update app data with the profile data
      setAppData(prev => ({
        ...prev,
        profileData
      }));

      // Navigate to profile page
      window.location.href = '/profile';
    };

    reader.readAsText(file);
  };

  return (
    <div className="page home-page">
      <div className="home-left">
        <div className="home-title">Parkinson AI Diagnostic System (PAIDS)</div>
        <div className="home-desc">&lt;insert description&gt;</div>
        <div className="home-footer">Developed by UF SmartSystem Labs</div>
      </div>
      <div className="home-right">
        <div className="home-upload-section">
          <button 
            className="home-btn upload-btn"
            onClick={() => fileInputRef.current?.click()}
          >
            Upload Existing Patient
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleExistingPatientUpload}
            style={{ display: 'none' }}
          />
          <div className="upload-hint">
            Upload a CSV file with patient information
          </div>
        </div>
        <button 
          className="home-btn new-btn"
          onClick={handleNewPatient}
        >
          New Patient
        </button>
        <div className="home-instructions">
          <div>Instructions</div>
          <ol>
            <li>Choose new or existing patient</li>
            <li>Fill out profile</li>
            <li>Upload and submit if necessary</li>
            <li>Start Evaluation</li>
            <li>Save all patient data</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

function Profile() {
  const { appData, setAppData } = useContext(AppDataContext);
  const [currentPage, setCurrentPage] = useState(1);
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    dob: '',
    hobbies: '',
    preexistingConditions: '',
    allergies: '',
    medication: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleApply = () => {
    // Store profile data in context instead of saving to file
    setAppData(prev => ({
      ...prev,
      profileData
    }));
  };

  const nextPage = () => {
    if (currentPage < 3) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  return (
    <div className="page profile-page">
      <div className="profile-title">Patient Information</div>
      <form className="profile-form" onSubmit={(e) => e.preventDefault()}>
        {currentPage === 1 && (
          <>
            <div className="profile-photo-container">
              <div className="profile-photo-placeholder">
                <span>Patient Photo</span>
                <input type="file" accept="image/*" className="profile-photo-input" />
              </div>
            </div>
            <div className="profile-row">
              <label>First name:</label>
              <input 
                type="text" 
                name="firstName"
                value={profileData.firstName}
                onChange={handleInputChange}
              />
            </div>
            <div className="profile-row">
              <label>Last name:</label>
              <input 
                type="text" 
                name="lastName"
                value={profileData.lastName}
                onChange={handleInputChange}
              />
            </div>
            <div className="profile-row">
              <label>DOB:</label>
              <input 
                type="date" 
                name="dob"
                value={profileData.dob}
                onChange={handleInputChange}
              />
            </div>
            <div className="profile-row">
              <label>Hobbies:</label>
              <textarea 
                name="hobbies"
                value={profileData.hobbies}
                onChange={handleInputChange}
                placeholder="Enter patient's hobbies..."
              />
            </div>
          </>
        )}

        {currentPage === 2 && (
          <>
            <div className="profile-row">
              <label>Preexisting conditions:</label>
              <textarea 
                name="preexistingConditions"
                value={profileData.preexistingConditions}
                onChange={handleInputChange}
                placeholder="Enter any preexisting conditions..."
              />
            </div>
            <div className="profile-row">
              <label>Allergies:</label>
              <textarea 
                name="allergies"
                value={profileData.allergies}
                onChange={handleInputChange}
                placeholder="Enter any allergies..."
              />
            </div>
            <div className="profile-row">
              <label>Medication:</label>
              <textarea 
                name="medication"
                value={profileData.medication}
                onChange={handleInputChange}
                placeholder="Enter current medications..."
              />
            </div>
          </>
        )}

        {currentPage === 3 && (
          <div className="profile-summary">
            <h3>Review Information</h3>
            <div className="summary-content">
              <p><strong>Name:</strong> {profileData.firstName} {profileData.lastName}</p>
              <p><strong>DOB:</strong> {profileData.dob}</p>
              <p><strong>Hobbies:</strong> {profileData.hobbies}</p>
              <p><strong>Preexisting Conditions:</strong> {profileData.preexistingConditions}</p>
              <p><strong>Allergies:</strong> {profileData.allergies}</p>
              <p><strong>Medication:</strong> {profileData.medication}</p>
            </div>
          </div>
        )}

        <div className="profile-navigation">
          {currentPage > 1 && (
            <button type="button" className="nav-arrow prev" onClick={prevPage}>
              ←
            </button>
          )}
          {currentPage < 3 && (
            <button type="button" className="nav-arrow next" onClick={nextPage}>
              →
            </button>
          )}
          {currentPage === 3 && (
            <button className="profile-apply-btn" onClick={handleApply}>
              Save Profile
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function Upload() {
  const { appData, setAppData } = useContext(AppDataContext);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [videoDuration, setVideoDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMarkingSegment, setIsMarkingSegment] = useState(false);
  const [segmentStart, setSegmentStart] = useState(0);
  const [segments, setSegments] = useState<Array<{ start: number; end: number; label: string; id: string }>>([]);
  const [selectedSegments, setSelectedSegments] = useState<Set<string>>(new Set());
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      
      // Store the video file in the app context
      setAppData(prev => ({
        ...prev,
        videoFile: file
      }));
    }
  };

  const handleVideoLoad = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    
    const timeline = e.currentTarget;
    const rect = timeline.getBoundingClientRect();
    const clickPosition = e.clientX - rect.left;
    const percentage = clickPosition / rect.width;
    const newTime = percentage * videoDuration;
    
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleSegmentButtonClick = () => {
    if (!isMarkingSegment) {
      // Start marking segment
      setIsMarkingSegment(true);
      setSegmentStart(currentTime);
    } else {
      // End marking segment
      setIsMarkingSegment(false);
      const newSegment = {
        start: segmentStart,
        end: currentTime,
        label: '',
        id: Math.random().toString(36).substr(2, 9) // Generate unique ID
      };
      setSegments([...segments, newSegment]);
    }
  };

  const handleLabelChange = (id: string, newLabel: string) => {
    setSegments(segments.map(segment => 
      segment.id === id ? { ...segment, label: newLabel } : segment
    ));
  };

  const handleSegmentSelect = (id: string) => {
    const newSelected = new Set(selectedSegments);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedSegments(newSelected);
  };

  const handleDeleteSelected = () => {
    setSegments(segments.filter(segment => !selectedSegments.has(segment.id)));
    setSelectedSegments(new Set());
  };

  const handleSaveSegments = () => {
    // Store segments in context instead of saving to file
    const segmentsToSave = segments.map(({ start, end, label }) => ({
      start,
      end,
      label
    }));
    
    setAppData(prev => ({
      ...prev,
      videoSegments: segmentsToSave
    }));
  };

  const handleSelectAll = () => {
    if (selectedSegments.size === segments.length) {
      // If all are selected, deselect all
      setSelectedSegments(new Set());
    } else {
      // Otherwise, select all
      setSelectedSegments(new Set(segments.map(segment => segment.id)));
    }
  };

  return (
    <div className="page upload-page">
      <div className="upload-box">
        {!videoUrl ? (
          <div className="upload-area" onClick={() => document.getElementById('video-upload')?.click()}>
            <div className="upload-arrow">↑</div>
            <div>Upload Video</div>
            <input
              id="video-upload"
              type="file"
              accept="video/*"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </div>
        ) : (
          <div className="video-container">
            <video
              ref={videoRef}
              src={videoUrl}
              controls
              onLoadedMetadata={handleVideoLoad}
              onTimeUpdate={handleTimeUpdate}
              className="video-player"
            />
            <div className="video-timeline" onClick={handleTimelineClick}>
              <div className="timeline-progress" style={{ width: `${(currentTime / videoDuration) * 100}%` }} />
              {segments.map((segment) => (
                <div
                  key={segment.id}
                  className="timeline-segment"
                  style={{
                    left: `${(segment.start / videoDuration) * 100}%`,
                    width: `${((segment.end - segment.start) / videoDuration) * 100}%`
                  }}
                  title={`${formatTime(segment.start)} - ${formatTime(segment.end)}: ${segment.label}`}
                />
              ))}
              {isMarkingSegment && (
                <div
                  className="timeline-segment marking"
                  style={{
                    left: `${(segmentStart / videoDuration) * 100}%`,
                    width: `${((currentTime - segmentStart) / videoDuration) * 100}%`
                  }}
                />
              )}
            </div>
            <div className="video-controls">
              <button 
                onClick={handleSegmentButtonClick} 
                className={`segment-btn ${isMarkingSegment ? 'marking' : ''}`}
              >
                {isMarkingSegment ? 'End Segment' : 'Mark Segment'}
              </button>
              <div className="time-display">
                {formatTime(currentTime)} / {formatTime(videoDuration)}
              </div>
            </div>
            <div className="segments-actions">
              <button 
                onClick={handleDeleteSelected} 
                className="action-btn delete-btn"
                disabled={selectedSegments.size === 0}
              >
                Delete Selected
              </button>
              <button 
                onClick={handleSaveSegments} 
                className="action-btn save-btn"
                disabled={segments.length === 0}
              >
                Save Segments
              </button>
            </div>
            <div className="segments-list">
              <div className="segments-list-header">
                <input
                  type="checkbox"
                  checked={segments.length > 0 && selectedSegments.size === segments.length}
                  onChange={handleSelectAll}
                  className="segment-checkbox"
                />
                <span className="select-all-label">Select All</span>
              </div>
              {segments.map((segment) => (
                <div key={segment.id} className="segment-item">
                  <input
                    type="checkbox"
                    checked={selectedSegments.has(segment.id)}
                    onChange={() => handleSegmentSelect(segment.id)}
                    className="segment-checkbox"
                  />
                  <span className="segment-time">
                    {formatTime(segment.start)} - {formatTime(segment.end)}
                  </span>
                  <input
                    type="text"
                    value={segment.label}
                    onChange={(e) => handleLabelChange(segment.id, e.target.value)}
                    placeholder="Enter segment label"
                    className="segment-label-input"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to format time
function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function Evaluate() {
  const { appData } = useContext(AppDataContext);
  const [isPlaying, setIsPlaying] = useState(false);
  const [analysisData, setAnalysisData] = useState<Array<{ time: number; value: number }>>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const analysisInterval = useRef<number | null>(null);

  const startAnalysis = () => {
    if (!videoRef.current) return;
    
    setIsPlaying(true);
    videoRef.current.play();
    
    // Start generating random analysis data
    analysisInterval.current = window.setInterval(() => {
      if (videoRef.current) {
        const currentTime = videoRef.current.currentTime;
        const randomValue = Math.floor(Math.random() * 10) + 1;
        
        setAnalysisData(prev => {
          const newData = [...prev, { time: currentTime, value: randomValue }];
          // Keep only the last 50 data points for performance
          return newData.slice(-50);
        });
      }
    }, 1000); // Update every second
  };

  const stopAnalysis = () => {
    if (analysisInterval.current) {
      clearInterval(analysisInterval.current);
      analysisInterval.current = null;
    }
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  // Calculate average severity
  const averageSeverity = analysisData.length > 0
    ? (analysisData.reduce((sum, point) => sum + point.value, 0) / analysisData.length).toFixed(1)
    : '0.0';

  // Cleanup interval on component unmount
  useEffect(() => {
    return () => {
      if (analysisInterval.current) {
        clearInterval(analysisInterval.current);
      }
    };
  }, []);

  return (
    <div className="page evaluate-page">
      <div className="evaluate-left">
        <div className="video-box">
          {appData.videoFile ? (
            <video
              ref={videoRef}
              src={URL.createObjectURL(appData.videoFile)}
              className="evaluation-video"
              controls={false}
              onEnded={stopAnalysis}
            />
          ) : (
            <div className="no-video-message">No video available for evaluation</div>
          )}
        </div>
        <button 
          className="evaluate-btn"
          onClick={isPlaying ? stopAnalysis : startAnalysis}
          disabled={!appData.videoFile}
        >
          {isPlaying ? 'Stop Analysis' : 'Start Analysis'}
        </button>
      </div>
      <div className="vertical-scale">
        {analysisData.length > 0 && (
          <div
            className="scale-fill"
            style={{
              height: `${(parseFloat(averageSeverity) / 10) * 100}%`
            }}
          />
        )}
        <div className="scale-lines">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="scale-line" />
          ))}
        </div>
        {analysisData.length > 0 && (
          <div
            className="average-marker"
            style={{
              top: `calc(${100 - (parseFloat(averageSeverity) / 10) * 100}% - 1px)`
            }}
          />
        )}
      </div>
      <div className="evaluate-right">
        <div className="chart-box">
          {analysisData.length > 0 ? (
            <>
              <div className="chart-axis y">Severity (1-10)</div>
              <svg className="analysis-chart" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Grid lines */}
                {[0, 20, 40, 60, 80, 100].map((y) => (
                  <line
                    key={y}
                    x1="0"
                    y1={y}
                    x2="100"
                    y2={y}
                    stroke="#ddd"
                    strokeWidth="0.5"
                  />
                ))}
                {/* Data line */}
                <path
                  d={analysisData.map((point, index) => {
                    const x = (index / (analysisData.length - 1)) * 100;
                    const y = 100 - (point.value * 10); // Scale value to fit in 100px height
                    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ')}
                  fill="none"
                  stroke="#4CAF50"
                  strokeWidth="2"
                />
                {/* Data points */}
                {analysisData.map((point, index) => {
                  const x = (index / (analysisData.length - 1)) * 100;
                  const y = 100 - (point.value * 10);
                  return (
                    <circle
                      key={index}
                      cx={x}
                      cy={y}
                      r="2"
                      fill="#4CAF50"
                    />
                  );
                })}
              </svg>
              <div className="chart-axis x">Time (seconds)</div>
            </>
          ) : (
            <div className="no-data-message">Analysis data will appear here</div>
          )}
        </div>
        <div className="evaluation-box">
          <h3>Evaluation Results</h3>
          <p>Analysis in progress...</p>
        </div>
      </div>
    </div>
  );
}

function Save() {
  const { appData } = useContext(AppDataContext);
  const [fileName, setFileName] = useState('');

  const handleSave = () => {
    if (!appData.profileData || appData.videoSegments.length === 0) {
      alert('Please complete both Profile and Upload sections before saving.');
      return;
    }

    // Create a zip file containing both profile and video segments data
    const data = {
      profile: appData.profileData,
      videoSegments: appData.videoSegments
    };

    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${fileName || 'patient_data'}.json`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="page save-page">
      <div className="save-disclaimer">
        Disclaimer: All data will be saved in a single JSON file containing both profile and video segment information.
      </div>
      <div className="save-form">
        <label>File Name:</label>
        <input 
          type="text" 
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          placeholder="Enter file name"
        />
        <button 
          className="save-btn"
          onClick={handleSave}
          disabled={!appData.profileData || appData.videoSegments.length === 0}
        >
          Save All Data
        </button>
      </div>
      <div className="save-status">
        <div className={`status-item ${appData.profileData ? 'completed' : 'pending'}`}>
          Profile Data: {appData.profileData ? '✓' : 'Pending'}
        </div>
        <div className={`status-item ${appData.videoSegments.length > 0 ? 'completed' : 'pending'}`}>
          Video Segments: {appData.videoSegments.length > 0 ? '✓' : 'Pending'}
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <AppDataProvider>
      <div className="app-container">
        <Navbar />
        <div className="content-background">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/evaluate" element={<Evaluate />} />
            <Route path="/save" element={<Save />} />
          </Routes>
        </div>
      </div>
    </AppDataProvider>
  );
}

export default App;
