import Commit from "../models/commitSchema";
import { Request, Response } from "express";


export const getCommitsByRepo = async (req: Request, res: Response) => {

    const { repoID } = req.params

    const commits = await Commit.find({ repository: repoID})
            .populate({
                path: 'associated_task',
                select: '_id task_name'
            })
            .select('-hash')
            .sort({ createdAt: -1 }); // Orden descendente por fecha de creación


    res.json({
        commits
    });

}

export const getCommitDiff = async (req: Request, res: Response) => {
  const { repoGitlabID, commit: { hash } } = req;

  const diffUrl = `https://gitlab.com/api/v4/projects/${encodeURIComponent(repoGitlabID)}/repository/commits/${hash}/diff`;
  const branchesUrl = `https://gitlab.com/api/v4/projects/${encodeURIComponent(repoGitlabID)}/repository/branches`;

  try {
      // Realiza ambas llamadas API simultáneamente
      const [diffResponse, branchesResponse] = await Promise.all([
          fetch(diffUrl, {
              headers: { 'Authorization': `Bearer ${process.env.GITLAB_ACCESS_TOKEN}` },
          }),
          fetch(branchesUrl, {
              headers: { 'Authorization': `Bearer ${process.env.GITLAB_ACCESS_TOKEN}` },
          })
      ]);

      // Verifica si alguna de las respuestas de la API no fue exitosa
      if (!diffResponse.ok) {
          return res.status(diffResponse.status).json({ message: `Error from GitLab API on diffs: ${diffResponse.statusText}` });
      }
      if (!branchesResponse.ok) {
          return res.status(branchesResponse.status).json({ message: `Error fetching branches: ${branchesResponse.statusText}` });
      }

      const diffData = await diffResponse.json();
      const branches = await branchesResponse.json();
      const branchesWithCommit = branches.filter(branch => branch.commit && branch.commit.id === hash);

      // Envía los resultados en la respuesta
      res.json({
          diff: diffData,
          branches: branchesWithCommit.map(branch => branch.name) // Devuelve solo los nombres de las ramas que contienen el commit
      });

  } catch (error) {
      console.error('Error fetching commit diffs or branches:', error);
      res.status(500).json({ message: 'Internal Server Error' });
  }
};


export const getProyectCommits = async (req: Request, res: Response) => {
    const { projectID } = req.params;
    const { owner, commits } = req
    const year = parseInt(req.query.year, 10); // Asegúrate de convertir el año a número

    try {

      if( owner && owner === true ) {
        let matchConditions = { project: projectID };
        if( year ){
          matchConditions = {
            ...matchConditions,
            createdAt: {
              $gte: new Date(`${year}-01-01T00:00:00.000Z`),
              $lte: new Date(`${year}-12-31T23:59:59.999Z`)
            }
          };
        }

          const commits = await Commit.find(matchConditions)
                  .populate({
                    path: 'associated_task',
                    select: '_id task_name'
                  })
                  .select('-hash')
                  .sort({ createdAt: -1 });

          return res.json({
              commits
          });
      } else {
        return res.json({
          commits
        });
      
      }

    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: 'Internal Server Error'
        });
    }
}


