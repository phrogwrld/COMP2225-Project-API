import Fastify, {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
} from 'fastify';
import type { FastifyServerOptions } from 'fastify';
import cors from '@fastify/cors';
import { Server, IncomingMessage, ServerResponse } from 'http';
import teams from './data/teams.json';
import * as fs from 'fs';
import path from 'path';
import { Credentials, TeamData, Metrics, WeekPoints } from './types';

class App {
  private server: FastifyInstance;

  constructor(private options: FastifyServerOptions = {}) {
    this.server = Fastify<Server, IncomingMessage, ServerResponse>(
      this.options
    );

    this.server.register(cors, {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });

    this.server.get('/', async (request, reply) => {
      return { hello: 'world' };
    });

    this.server.get('/team', async (request, reply) => {
      return teams;
    });

    this.server.get(
      '/api/team/:id',
      async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
        console.log(request.params.id);
        const team = teams.find(
          (team) => team.id === parseInt(request.params.id)
        );

        if (!team) {
          reply
            .code(404)
            .send({ message: `Team ${request.params.id} not found` });
        } else {
          return team;
        }
      }
    );

    this.server.post(
      '/api/team/:id/week/:week',
      async (
        request: FastifyRequest<{
          Params: { id: string; week: string };
        }>,
        reply
      ) => {
        const team = teams.find(
          (team) => team.id === parseInt(request.params.id)
        );
        if (!team) {
          reply.code(404);
          return { message: `Team ${request.params.id} not found` };
        }

        let week = team.weeks.find(
          (week) => week.week === parseInt(request.params.week)
        );
        if (!week) {
          week = {
            week: parseInt(request.params.week),
            points: 0,
            metrics: {
              requirements_volatility: 0,
              spec_docs: 0,
              size_lines_of_code: 0,
              design_faults: 0,
            },
          };
          team.weeks.push(week);
        }

        const teamsFilePath = path.join(__dirname, 'data', 'teams.json');

        fs.writeFileSync(teamsFilePath, JSON.stringify(teams, null, 2));
      }
    );

    this.server.put(
      '/api/team/:id/week/:week',
      async (
        request: FastifyRequest<{
          Params: { id: string; week: string };
          Body: {
            requirements_volatility: number;
            spec_docs: number;
            size_lines_of_code: number;
            design_faults: number;
          };
        }>,
        reply
      ) => {
        const prevTeam = JSON.parse(JSON.stringify(teams));

        const team = teams.find(
          (team) => team.id === parseInt(request.params.id)
        );
        if (!team) {
          reply.code(404);
          return { message: `Team ${request.params.id} not found` };
        }

        teams.find;
        const week = team.weeks.find(
          (week: WeekPoints) => week.week === parseInt(request.params.week)
        );
        if (!week) {
          reply.code(404);
          return { message: `Week ${request.params.week} not found` };
        }

        const metric1 = request.body.requirements_volatility * 10;
        const metric2 = request.body.spec_docs * 10;
        const metric3 = request.body.size_lines_of_code * 10;
        const metric4 = request.body.design_faults * -10;

        week.points = metric1 + metric2 + metric3 + metric4;
        week.metrics = {
          requirements_volatility: request.body.requirements_volatility,
          spec_docs: request.body.spec_docs,
          size_lines_of_code: request.body.size_lines_of_code,
          design_faults: request.body.design_faults,
        };

        const sortedTeams = [...teams].sort((a: TeamData, b: TeamData) => {
          const bTotal = b.weeks.reduce((acc, week) => acc + week.points, 0);
          const aTotal = a.weeks.reduce((acc, week) => acc + week.points, 0);

          return bTotal - aTotal;
        });

        sortedTeams.forEach((team: TeamData, index: number) => {
          console.log(index + 1, team.name);
          team.rank = index + 1;
        });

        console.log(sortedTeams);

        sortedTeams.forEach((team: TeamData, index: number) => {
          const prevIndex = prevTeam.findIndex(
            (prevTeam: TeamData) => prevTeam.id === team.id
          );
          team.change = prevTeam[prevIndex].rank - team.rank;
        });

        const teamsFilePath = path.join(__dirname, 'data', 'teams.json');

        fs.writeFileSync(teamsFilePath, JSON.stringify(sortedTeams, null, 2));

        return sortedTeams;
      }
    );

    this.server.post(
      '/api/login',
      async function authUser(
        request: FastifyRequest<{ Body: Credentials }>,
        reply: FastifyReply
      ) {
        const { username, password } = request.body;

        const usersFilePath = path.join(__dirname, 'data', 'user.json');

        const users = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));

        const user = users.find(
          (user: { username: string; password: string }) => {
            return user.username === username && user.password === password;
          }
        );

        if (!user) {
          reply.code(401);
          return { message: 'Invalid credentials' };
        } else {
          reply.send(user);
        }
      }
    );
  }

  async start() {
    try {
      await this.server.listen({ port: 3000, host: 'localhost' });
    } catch (e) {
      console.log(e);
      process.exit(1);
    }
  }
}

export default App;
