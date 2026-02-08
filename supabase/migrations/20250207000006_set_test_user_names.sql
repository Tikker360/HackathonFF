-- Set team names for the two test users
update public.profiles
  set team_name = 'Team Alpha'
  where id = '69af8901-c568-4e88-ae75-ca0bc1f706b1';

update public.profiles
  set team_name = 'Team Bravo'
  where id = '025c6f7a-2d0e-4c6a-a9c8-b0ace616bf73';
