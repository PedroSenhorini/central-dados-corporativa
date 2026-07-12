update public.profiles
set papel = 'admin'
where id = (select id from auth.users where email = 'pedrosenhorini0@gmail.com');
