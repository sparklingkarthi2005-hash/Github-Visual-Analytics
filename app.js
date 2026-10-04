let chartInstance = null;

async function fetchProfile() {
  const username = document.getElementById('username').value.trim();
  if (!username) return alert('Please enter a username');

  try {
    const userRes = await fetch(`https://api.github.com/users/${username}`);
    if (!userRes.ok) throw new Error('User not found');
    const user = await userRes.json();

    const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`);
    const repos = await reposRes.json();

    document.getElementById('avatar').src = user.avatar_url;
    document.getElementById('name').innerText = user.name || user.login;
    document.getElementById('bio').innerText = user.bio || 'No bio available';
    document.getElementById('repos-count').innerText = user.public_repos;
    document.getElementById('followers-count').innerText = user.followers;

    const totalStars = repos.reduce((acc, r) => acc + r.stargazers_count, 0);
    const score = Math.min(100, Math.round((user.public_repos * 2) + (user.followers * 1.5) + (totalStars * 3)));
    document.getElementById('dev-score').innerText = score;

    renderChart(repos);
    renderTopRepos(repos);

    document.getElementById('profile-card').classList.remove('hidden');
    document.getElementById('charts-section').classList.remove('hidden');

  } catch (err) {
    alert(err.message);
  }
}

function renderChart(repos) {
  const languages = {};
  repos.forEach(repo => {
    if (repo.language) {
      languages[repo.language] = (languages[repo.language] || 0) + 1;
    }
  });

  const labels = Object.keys(languages);
  const data = Object.values(languages);

  if (chartInstance) chartInstance.destroy();

  const ctx = document.getElementById('langChart').getContext('2d');
  chartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#3b82f6']
      }]
    },
    options: {
      plugins: {
        legend: { labels: { color: '#ffffff' } }
      }
    }
  });
}

function renderTopRepos(repos) {
  const topRepos = repos.sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 5);
  const listEl = document.getElementById('repo-list');
  listEl.innerHTML = topRepos.map(repo => `
    <li class="bg-gray-700/50 p-3 rounded flex justify-between items-center border border-gray-600">
      <div>
        <a href="${repo.html_url}" target="_blank" class="font-bold text-indigo-400 hover:underline">${repo.name}</a>
        <p class="text-xs text-gray-400">${repo.language || 'Plain Text'}</p>
      </div>
      <div class="text-xs text-gray-300">
        ⭐ ${repo.stargazers_count} | 🍴 ${repo.forks_count}
      </div>
    </li>
  `).join('');
}