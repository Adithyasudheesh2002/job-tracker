// Elements
const jobForm = document.getElementById('jobForm');
const jobTitleSelect = document.getElementById('jobTitle');
const customJobTitleInput = document.getElementById('customJobTitle');
const companyInput = document.getElementById('company');
const statusSelect = document.getElementById('status');
const jobList = document.getElementById('jobList');
const filterStatus = document.getElementById('filterStatus');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');

let jobs = [];
let editIndex = null; // NEW: track index for editing

// Show/hide custom job title input
jobTitleSelect.addEventListener('change', () => {
  if (jobTitleSelect.value === 'Custom') {
    customJobTitleInput.style.display = 'block';
    customJobTitleInput.required = true;
  } else {
    customJobTitleInput.style.display = 'none';
    customJobTitleInput.required = false;
  }
});

// Load jobs from localStorage
window.onload = () => {
  const savedJobs = localStorage.getItem('jobs');
  if (savedJobs) {
    jobs = JSON.parse(savedJobs);
    renderJobs();
  }
};

// Save jobs to localStorage
function saveJobs() {
  localStorage.setItem('jobs', JSON.stringify(jobs));
}

// Render jobs to the page with filtering and sorting
function renderJobs() {
  jobList.innerHTML = '';

  const filter = filterStatus.value.toLowerCase();
  const search = searchInput.value.trim().toLowerCase();
  const sortBy = sortSelect.value;

  let filteredJobs = jobs
    .map((job, originalIndex) => ({ ...job, originalIndex })) // include original index
    .filter(job => {
      const statusMatch = filter === 'all' || job.status.toLowerCase() === filter;
      const searchMatch =
        job.title.toLowerCase().includes(search) || job.company.toLowerCase().includes(search);
      return statusMatch && searchMatch;
    });

  switch (sortBy) {
    case 'titleAsc':
      filteredJobs.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'companyAsc':
      filteredJobs.sort((a, b) => a.company.localeCompare(b.company));
      break;
    case 'statusAsc':
      filteredJobs.sort((a, b) => a.status.localeCompare(b.status));
      break;
    case 'dateDesc':
    default:
      filteredJobs = filteredJobs.slice().reverse();
      break;
  }

  filteredJobs.forEach((job) => {
    const li = document.createElement('li');
    li.className = 'job-item';

    li.innerHTML = `
      <div class="job-info">
        <h3>${job.title}</h3>
        <p><strong>Company:</strong> ${job.company}</p>
        <p class="job-status status-${job.status}">${job.status}</p>
      </div>
      <div class="job-actions">
        <button onclick="editJob(${job.originalIndex})">Edit</button>
        <button onclick="deleteJob(${job.originalIndex})">Delete</button>
      </div>
    `;
    jobList.appendChild(li);
  });
}

// Add or update job
jobForm.addEventListener('submit', e => {
  e.preventDefault();

  let title = jobTitleSelect.value === 'Custom' ? customJobTitleInput.value.trim() : jobTitleSelect.value;
  if (!title) {
    alert('Please enter a job title');
    return;
  }

  const company = companyInput.value.trim();
  if (!company) {
    alert('Please enter a company name');
    return;
  }

  const status = statusSelect.value;
  const newJob = { title, company, status };

  if (editIndex !== null) {
    jobs[editIndex] = newJob;
    editIndex = null;
  } else {
    jobs.push(newJob);
  }

  saveJobs();
  renderJobs();
  jobForm.reset();
  customJobTitleInput.style.display = 'none';
});

// Delete job
function deleteJob(index) {
  if (confirm('Are you sure you want to delete this job?')) {
    jobs.splice(index, 1);
    saveJobs();
    renderJobs();
  }
}

// Edit job
function editJob(index) {
  const job = jobs[index];
  editIndex = index;

  if (['Software Engineer', 'Data Analyst', 'Product Manager'].includes(job.title)) {
    jobTitleSelect.value = job.title;
    customJobTitleInput.style.display = 'none';
    customJobTitleInput.value = '';
    customJobTitleInput.required = false;
  } else {
    jobTitleSelect.value = 'Custom';
    customJobTitleInput.style.display = 'block';
    customJobTitleInput.value = job.title;
    customJobTitleInput.required = true;
  }

  companyInput.value = job.company;
  statusSelect.value = job.status;
}

// Filters and sorting
filterStatus.addEventListener('change', renderJobs);
searchInput.addEventListener('input', renderJobs);
sortSelect.addEventListener('change', renderJobs);
